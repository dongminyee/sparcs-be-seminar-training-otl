# 03 · 시간표 모델과 내 시간표 조회

한 사용자가 여러 개설강의를 담을 수 있고, 한 개설강의도 여러 사용자의 시간표에 들어갑니다. 두 테이블을 잇는 모델을 만들고, 로그인한 사용자에게 연결된 강의를 조회합니다.

## 03a · 모델을 만들고 DB에 반영하기

[Prisma 스키마](../../apps/api/prisma/schema.prisma)에 `TimetableLecture`를 추가하세요.

- `userId`, `lectureId`는 `Int`입니다. 각 ID로 `User`, `Lecture`를 참조하는 관계를 만들고, 두 모델에 역관계 배열 `timetable`을 추가합니다.
- 사용자·강의 쌍을 `@@id([userId, lectureId])`로 묶습니다. 강의 삭제 이벤트가 `lectureId`만으로 연결 행을 찾을 수 있게 그 필드에 인덱스도 둡니다.
- 사용자 외래 키에는 `onDelete: Cascade`, 강의 외래 키에는 `onDelete: Restrict`를 사용합니다. 05에서 강의의 삭제 시각을 기록한 뒤 EventHandler가 시간표 행을 정리합니다.

MySQL이 켜진 상태에서 실행하세요. Nest의 watch 프로세스가 스키마 변경 후 예전 Client를 사용하면 재시작합니다.

```sh
pnpm db:migrate --name add_timetable
pnpm db:generate
```

생성된 SQL에 새 테이블, 복합 기본 키, 두 외래 키가 있는지 확인합니다. 스키마와 새 SQL을 함께 커밋하세요.

## 03b · 연결된 강의를 조회하기

준비된 [시간표 Repository](support/timetable.repository.ts)를 복사하세요. 이 파일에는 05와 06에 필요한 변경 쿼리가 들어 있고, 조회 쿼리는 직접 채웁니다.

```sh
cp exercises/03-timetable-model/support/timetable.repository.ts \
  apps/api/src/timetable/repository/timetable.repository.ts
```

1. `TimetableRepository.findByUser(userId, db)`에서 `db.timetableLecture.findMany()`로 해당 사용자 행을 찾습니다. `lecture.deletedAt`이 `null`인 강의만 포함합니다.
2. 각 행에서 `lecture`를 선택할 때 01의 `lectureSelection`을 재사용하세요. 강의를 `lecture.code`, `lectureId` 순으로 정렬하고, 조회 결과를 강의 배열로 변환합니다.
3. [TimetableService.findMine()](../../apps/api/src/timetable/service/timetable.service.ts)에서 Repository에 사용자 ID를 넘깁니다. [Controller](../../apps/api/src/timetable/presentation/timetable.controller.ts)는 이미 Guard를 거쳐 `request.user.id`를 넘깁니다.

```sh
curl -i http://127.0.0.1:3001/api/timetable
curl -i http://127.0.0.1:3001/api/timetable -H "Authorization: Bearer $TOKEN"
```

첫 응답은 `401`, 두 번째는 새 시간표에서 `200 []`입니다. 아직 담기 API가 없으므로 다음 SQL로 첫 연결 행을 만들어 보세요.

```sh
docker compose exec -T mysql sh -c 'exec mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' <<'SQL'
INSERT IGNORE INTO TimetableLecture (userId, lectureId)
SELECT id, 1005 FROM User WHERE username = 'student';
SQL
```

같은 토큰으로 다시 조회하면 신호 및 시스템(1005)이 나타납니다. 이 행은 05에서 재사용할 수 있습니다.

[전체 실습 순서](../../README.md#실습-순서)
