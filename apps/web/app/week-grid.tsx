import type { ClassTime, Lecture } from '@mini-otl/contracts';

export const days = ['월', '화', '수', '목', '금'];

export function timeLabel(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

type Tile = ClassTime & { lecture: Lecture; lane: number };

function placeTiles(tiles: Omit<Tile, 'lane'>[]) {
  const laneEnds: number[] = [];
  const positioned = tiles.sort((a, b) => a.begin - b.begin).map((tile) => {
    const available = laneEnds.findIndex((end) => end <= tile.begin);
    const lane = available === -1 ? laneEnds.length : available;
    laneEnds[lane] = tile.end;
    return { ...tile, lane };
  });
  return { positioned, laneCount: laneEnds.length };
}

export function WeekGrid({ lectures }: { lectures: Lecture[] }) {
  const tiles = lectures.flatMap((lecture) => lecture.classes.map((slot) => ({ ...slot, lecture })));
  const firstHour = Math.min(9, ...tiles.map(({ begin }) => Math.floor(begin / 60)));
  const lastHour = Math.max(18, ...tiles.map(({ end }) => Math.ceil(end / 60)));
  const hours = Array.from({ length: lastHour - firstHour }, (_, index) => firstHour + index);
  const totalMinutes = hours.length * 60;

  return (
    <div className="week-scroll" tabIndex={0} aria-label="주간 시간표">
      <div className="week">
        <div className="week-heading" aria-hidden="true">
          <span />
          {days.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="week-body" style={{ height: hours.length * 44 }}>
          <div className="hours" aria-hidden="true">
            {hours.map((hour) => <span key={hour}>{timeLabel(hour * 60)}</span>)}
          </div>
          {days.map((day, index) => {
            const { positioned, laneCount } = placeTiles(tiles.filter((tile) => tile.day === index));
            return (
              <div className="day" key={day} aria-label={`${day}요일`}>
                {positioned.map(({ lecture, begin, end, room, lane }) => (
                  <div
                    className={`tile tone-${lecture.id % 4}`}
                    key={`${lecture.id}-${begin}`}
                    title={`${lecture.title} · ${day} ${timeLabel(begin)}–${timeLabel(end)} · ${room}`}
                    style={{
                      top: `${100 * (begin - firstHour * 60) / totalMinutes}%`,
                      height: `${100 * (end - begin) / totalMinutes}%`,
                      left: `${100 * lane / laneCount}%`,
                      width: `${100 / laneCount}%`,
                    }}
                  >
                    <strong>{lecture.title}</strong><small>{room}</small>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
