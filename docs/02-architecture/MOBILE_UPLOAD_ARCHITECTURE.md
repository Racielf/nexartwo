# MOBILE_UPLOAD_ARCHITECTURE — NexArtWO

## Goal

Support mobile camera and file upload for field workflows.

## Use cases

- Receipt photo
- Invoice upload
- Work Order photos
- Project before/during/after photos
- Documents attached to expenses/projects

## Design questions

- Where files are stored?
- Are files linked to project, WO, expense or client?
- Is offline capture supported?
- Are images compressed?
- Are file types restricted?
- How are documents secured?

## Rule

Do not implement upload before storage and metadata contract are defined.
