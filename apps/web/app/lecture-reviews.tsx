"use client";

import { useState, type FormEvent } from "react";
import {
  reviewContentLimit,
  type Review,
  type Session,
} from "@mini-otl/contracts";
import { request, useApi } from "./api-client";
import { ApiError } from "./api-error";

type Props = { lectureId: number; session?: Session; openLogin: () => void };

export function LectureReviews({ lectureId, session, openLogin }: Props) {
  const path = `lectures/${lectureId}/reviews`;
  const reviews = useApi<Review[]>(path, session?.accessToken);
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState("");
  const hasReview = reviews.data?.some(
    ({ author }) => author.id === session?.user.id,
  );

  async function mutate(
    target: string,
    init: RequestInit,
    onSuccess?: () => void,
  ) {
    if (!session) {
      openLogin();
      return;
    }

    setPending(true);
    setActionError("");
    try {
      await request(target, { ...init, token: session.accessToken });
      onSuccess?.();
      reviews.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "리뷰 요청에 실패했습니다.",
      );
    } finally {
      setPending(false);
    }
  }

  function createReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void mutate(
      path,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content }),
      },
      () => setContent(""),
    );
  }

  return (
    <section className="lecture-reviews" aria-label="강의 리뷰">
      <h4>강의 리뷰 {reviews.data && <span>{reviews.data.length}개</span>}</h4>
      {reviews.error && (
        <ApiError message={reviews.error} retry={reviews.refresh} />
      )}
      {actionError && <ApiError message={actionError} />}
      {!reviews.data && !reviews.error && (
        <p className="empty">리뷰를 불러오는 중…</p>
      )}
      {reviews.data?.length === 0 && (
        <p className="empty">아직 작성된 리뷰가 없습니다.</p>
      )}
      {reviews.data && reviews.data.length > 0 && (
        <ul className="review-list">
          {reviews.data.map(review => {
            const mine = review.author.id === session?.user.id;
            const itemPath = `${path}/${review.id}`;
            return (
              <li key={review.id} className="review-card">
                <div className="review-meta">
                  <strong>{review.author.name}</strong>
                  {mine && <span className="count">내 리뷰</span>}
                </div>
                <p>{review.content}</p>
                {(mine || review.heartCount !== undefined) && (
                  <div className="review-actions">
                    {review.heartCount !== undefined &&
                      (mine ? (
                        <span
                          className="heart-total"
                          aria-label={`하트 ${review.heartCount}개`}
                        >
                          ♥ {review.heartCount}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="button heart-button"
                          aria-pressed={review.heartedByMe ?? false}
                          aria-label={`${review.author.name} 리뷰 하트`}
                          disabled={pending}
                          onClick={() =>
                            void mutate(`${itemPath}/heart`, {
                              method: review.heartedByMe ? "DELETE" : "POST",
                            })
                          }
                        >
                          {review.heartedByMe ? "♥" : "♡"} {review.heartCount}
                        </button>
                      ))}
                    {mine && (
                      <button
                        className="text-button"
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          void mutate(itemPath, { method: "DELETE" })
                        }
                      >
                        리뷰 삭제
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {reviews.data &&
        (session ? (
          !hasReview && (
            <form className="review-form" onSubmit={createReview}>
              <label>
                리뷰 작성
                <textarea
                  value={content}
                  maxLength={reviewContentLimit}
                  onChange={event => setContent(event.target.value)}
                  placeholder="이 강의를 들은 경험을 남겨 주세요."
                  required
                />
              </label>
              <button
                className="button primary"
                disabled={pending || !content.trim()}
              >
                등록
              </button>
            </form>
          )
        ) : (
          <button
            type="button"
            className="text-button review-login"
            onClick={openLogin}
          >
            로그인하고 리뷰 남기기
          </button>
        ))}
    </section>
  );
}
