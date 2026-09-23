# Task: direct messaging

**Time:** 30 minutes. Get the app running by following the README in the repo first.

## What to build

Signed-in users can message each other one to one.

1. A sent message reaches the other person straight away, without a page refresh.
2. Conversations are saved. After a reload, the history is still there.
3. A user who isn't looking at a conversation still finds out when a new message arrives in it.

Messages are plain text only. Attachments, images and formatting are out of scope.

## Rules

- Build on the existing stack: FastAPI, MongoDB, Angular. Add packages if you need them.
- Any tools are allowed, including AI assistants. Be ready to explain every line you submit.
- Treat this as code you would ship.

## Done means

Two users, signed in on two browser tabs, can message each other in real time, the history
survives a reload, and a new message is noticeable to a user who isn't looking at that
conversation.
