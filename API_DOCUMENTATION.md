# API Documentation

## Auth

| Method | Route | Description | JWT |
|---|---|---|---|
| POST | `/api/auth/register` | Create a new user account. | No |
| POST | `/api/auth/login` | Authenticate a user and return access credentials. | No |

## Tools

| Method | Route | Description | JWT |
|---|---|---|---|
| GET | `/api/tools` | List all tools. | Yes |
| GET | `/api/tools/:id` | Get a tool by ID. | Yes |
| POST | `/api/tools` | Create a new tool. | Yes |
| PUT | `/api/tools/:id` | Update a tool by ID. | Yes |
| DELETE | `/api/tools/:id` | Delete a tool by ID. | Yes |
| POST | `/api/tools/:id/image` | Upload or replace the tool image. | Yes |
| DELETE | `/api/tools/:id/image` | Remove the tool image. | Yes |
| GET | `/api/tools/:id/github-stats` | Get GitHub-related statistics for a tool. | Yes |

## Categories

| Method | Route | Description | JWT |
|---|---|---|---|
| GET | `/api/categories` | List all categories. | Yes |
| GET | `/api/categories/:id` | Get a category by ID. | Yes |
| POST | `/api/categories` | Create a new category. | Yes |
| PUT | `/api/categories/:id` | Update a category by ID. | Yes |
| DELETE | `/api/categories/:id` | Delete a category by ID. | Yes |

## Tags

| Method | Route | Description | JWT |
|---|---|---|---|
| GET | `/api/tags` | List all tags. | Yes |
| GET | `/api/tags/:id` | Get a tag by ID. | Yes |
| POST | `/api/tags` | Create a new tag. | Yes |
| PUT | `/api/tags/:id` | Update a tag by ID. | Yes |
| DELETE | `/api/tags/:id` | Delete a tag by ID. | Yes |
