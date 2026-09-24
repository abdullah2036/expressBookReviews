# Book Reviews API — Node.js + Express

A REST API for an online bookshop. Anyone can browse books by ISBN, author or title; registered users log in with a **JWT stored in a session** and can add, edit or delete **their own** reviews.

*Final project for the IBM course "Developing Back-End Apps with Node.js and Express", part of the IBM Full Stack Software Developer certificate ([verified](https://coursera.org/verify/professional-cert/ZYDXA0Y9YY1V)). Forked from the course template; the API implementation in `final_project/` is mine.*

## Endpoints

**Public** (`router/general.js`)

| Method | Route | Description |
|---|---|---|
| `POST` | `/register` | create an account (`{ username, password }`) |
| `GET` | `/` | all books |
| `GET` | `/isbn/:isbn` | book by ISBN |
| `GET` | `/author/:author` | books by author |
| `GET` | `/title/:title` | books by title |
| `GET` | `/review/:isbn` | reviews for a book |
| `GET` | `/async/books` · `/async/isbn/:isbn` · `/async/author/:author` · `/async/title/:title` | the same lookups fetched through **Axios**, written with async/await and with Promise callbacks |

**Authenticated** (`router/auth_users.js`)

| Method | Route | Description |
|---|---|---|
| `POST` | `/customer/login` | log in; issues a JWT and stores it in the session |
| `PUT` | `/customer/auth/review/:isbn?review=…` | add or update your review |
| `DELETE` | `/customer/auth/review/:isbn` | delete your review |

Every `/customer/auth/*` route passes through middleware in `index.js` that reads the token from the session and verifies it with `jsonwebtoken`. It returns `403` if the user isn't logged in or the token is invalid.

## Example session

```bash
curl -X POST -H 'Content-Type: application/json' \
     -d '{"username":"testuser","password":"password123"}' http://localhost:5000/register
# {"message":"User successfully registered. Now you can login"}

curl -X POST -H 'Content-Type: application/json' -c cookies.txt \
     -d '{"username":"testuser","password":"password123"}' http://localhost:5000/customer/login
# {"message":"User successfully logged in","token":"eyJhbGciOi..."}

curl -X PUT -b cookies.txt \
     'http://localhost:5000/customer/auth/review/1?review=This%20book%20is%20a%20masterpiece%20of%20African%20literature.'
# {"message":"The review for the book with ISBN 1 has been added by testuser",
#  "reviews":{"testuser":"This book is a masterpiece of African literature."}}

curl -X DELETE -b cookies.txt http://localhost:5000/customer/auth/review/1
# {"message":"Review for the book with ISBN 1 posted by the user testuser deleted.","reviews":{}}
```

The full set of recorded requests and responses is in [`final_project/submission/`](final_project/submission/).

## Run locally

```bash
git clone https://github.com/abdullah2036/expressBookReviews.git
cd expressBookReviews/final_project
npm install
npm start          # nodemon index.js → http://localhost:5000
```

## Project structure

```
final_project/
├── index.js               Express app, session setup, JWT auth middleware
├── router/
│   ├── general.js         public routes + Axios async/Promise variants
│   ├── auth_users.js      login and review add/update/delete
│   └── booksdb.js         in-memory book data
└── submission/            recorded curl requests and responses
```

## Tech stack

Node.js · Express · express-session · jsonwebtoken · Axios

---

Built by **Abdullah Bokhary** · [Portfolio](https://abdullah.pageui.workers.dev/) · [LinkedIn](https://www.linkedin.com/in/abdullah-bokhary-840315326/) · [GitHub](https://github.com/abdullah2036)
