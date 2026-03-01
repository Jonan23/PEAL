## Backend-Canonical API Alignment (PEAL + peal-server)

Scope of this pass: auth, requests/upload, messaging.

### Auth

| Flow     | Frontend expectation                             | Backend canonical         | Status  |
| -------- | ------------------------------------------------ | ------------------------- | ------- |
| Login    | `POST /api/auth/login`                           | `POST /api/auth/login`    | Aligned |
| Register | `POST /api/auth/register`                        | `POST /api/auth/register` | Aligned |
| Refresh  | `POST /api/auth/refresh` body `{ refreshToken }` | same                      | Aligned |
| Me       | `GET /api/auth/me`                               | same                      | Aligned |
| Logout   | `POST /api/auth/logout`                          | same                      | Aligned |

Notes:

- Frontend now mirrors tokens from local storage to cookies so SvelteKit SSR route guards can read them.

### Requests

| Flow      | Frontend expectation                          | Backend canonical              | Status                                |
| --------- | --------------------------------------------- | ------------------------------ | ------------------------------------- |
| List      | `GET /api/requests` returns `{ requests }`    | returns `{ data, pagination }` | Adapter added in frontend API wrapper |
| Get by id | `GET /api/requests/:id` returns `{ request }` | same                           | Aligned                               |
| Create    | `POST /api/requests`                          | same                           | Aligned                               |
| Update    | `PUT /api/requests/:id`                       | same                           | Aligned                               |
| Delete    | `DELETE /api/requests/:id`                    | same                           | Aligned                               |
| Donate    | `POST /api/requests/:id/donate`               | same                           | Aligned                               |
| Donations | expected `{ donations }`                      | returns `{ data, pagination }` | Adapter added in frontend API wrapper |

### Uploads

| Flow            | Frontend expectation                | Backend canonical                                 | Status                                                                       |
| --------------- | ----------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| Presigned URL   | body used `filename` + `type`       | backend requires `fileName` + `contentType`       | Updated frontend endpoint wrapper                                            |
| Complete upload | old body `{ fileUrl }`              | backend requires `{ key, fileName, contentType }` | Updated frontend endpoint wrapper and existing upload helper already aligned |
| Delete file     | old `DELETE /api/uploads` with body | backend `DELETE /api/uploads/:key`                | Updated frontend endpoint wrapper                                            |

### Messaging + Realtime

| Flow                | Frontend expectation                                             | Backend canonical                                       | Status                                          |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| Conversations list  | `/api/messages/conversations`                                    | `GET /api/messages`                                     | Updated frontend wrapper + response adapter     |
| Conversation detail | `/api/messages/conversations/:id` returning top-level `messages` | `GET /api/messages/:id` returns `conversation.messages` | Updated frontend wrapper + response adapter     |
| Send message        | `/api/messages/conversations/:id/messages`                       | `POST /api/messages/:id/messages`                       | Updated frontend wrapper                        |
| Mark read           | `PATCH /api/messages/conversations/:id/read`                     | `PUT /api/messages/:id/read`                            | Updated frontend wrapper                        |
| Socket protocol     | native WebSocket                                                 | Socket.IO auth handshake + events                       | Frontend websocket client migrated to Socket.IO |

Notes:

- Frontend message page now joins/leaves conversation rooms and emits typing indicators.
- Backend currently emits typing events only; message push events are not emitted server-side yet.

### Remaining Follow-ups (Not in this pass)

- Backend should emit `message_received` events from message routes for true realtime delivery.
- Add shared contract tests to prevent route/method/shape drift.
- Normalize all non-priority endpoints (notifications/settings/admin/etc.) to backend-canonical shapes.
