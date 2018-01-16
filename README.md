# Issue Mapper

CLI tool for mapping issues across third party platforms.

Whether you call them issues (in the case of git), cards (in the case of Trello)) they all
share a similar purpose: *To keep track of progress for a particular feature that needs to be worked on*

They also share multiple common features:

- An issue can have a `title` & `description`
- An issue can have any number of `attachments`
- Most importantly, and issue hosts a discussion thread or `comments`
- Additionally issues can have `labels`, `assignees`, `dues date` & many other platform specific features

The purpose of this tools is to create a uniform layer for mapping from input to output

## Install

1. `git clone git@github.com:felipearosemena/issue-mapper.git`
2. `cd issue-mapper`

## Configuration

The mapper uses each platform's APIs under the hood to get & post issues.

You must make sure to populate the `.env` file with the required API credentials for the platforms you're going to work with.

Use `.env-sample` as your starting point to config your own credentials.

## Usage

`node index.js --i <input-name> --o <output-name> <arguments>`

Each mappping has it's own set of specific required arguments. See below.

## Mappings

### Trello

**`.env` credentials**

`TRELLO_APP_KEY` : Your trello application key
`TRELLO_USER_TOKEN` : Trello unique user token

**Command Arguments**

`--trello_board_id` : Id for the board you want to get/post cards

### Gitlab

**`.env` credentials**

`GITLAB_TOKEN` : Gitlab private token

**Command Arguments**

`--gitlab_project_id` : Name of the project you want to get/post issues. The name must contain the username + project name.

Example `my-gitlab-user/my-awesome-project`

## Sample Usage

Get trello cards & map them over to git lab

`node index.js --i trello --trello_board_id <trello-board-id> --o gitlab --gitlab_project_id <my-gitlab-user/my-awesome-project>`
