#!/bin/bash
# Runs every required cURL command against the running server and saves each
# command + its output into the exact file names required by the grader.
# Usage:  bash generate_submission.sh
# The server must be startable with "node index.js" from this directory.

HOST="http://localhost:5000"
OUT="submission"
mkdir -p "$OUT"
rm -f cookies.txt

# --- start the server in the background -----------------------------------
node index.js > server.log 2>&1 &
SERVER_PID=$!
echo "Started server (pid $SERVER_PID), waiting for it to accept connections..."
curl -s --retry 30 --retry-connrefused --retry-delay 1 -o /dev/null "$HOST/" || {
  echo "Server did not start. See server.log"; kill $SERVER_PID 2>/dev/null; exit 1;
}

# run <output-file> <curl args...> : prints the command, then its output
run () {
  local file="$1"; shift
  {
    printf 'curl'
    for a in "$@"; do
      case "$a" in
        *[[:space:]\?\&\{\}\"]*) printf " '%s'" "$a" ;;
        *) printf ' %s' "$a" ;;
      esac
    done
    printf '\n'
    curl -s "$@"
    printf '\n'
  } > "$OUT/$file"
  echo "===== $file ====="
  cat "$OUT/$file"
  echo
}

# --- Task 1 : get all books ------------------------------------------------
run getallbooks "$HOST/"

# --- Task 2 : get book by ISBN --------------------------------------------
run getbooksbyISBN "$HOST/isbn/1"

# --- Task 3 : get books by author -----------------------------------------
run getbooksbyauthor "$HOST/author/Chinua%20Achebe"

# --- Task 4 : get books by title ------------------------------------------
run getbooksbytitle "$HOST/title/Things%20Fall%20Apart"

# --- Task 6 : register a new user -----------------------------------------
run register -X POST -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"password123"}' \
    "$HOST/register"

# --- Task 7 : login as the registered user (stores the session cookie) -----
run login -X POST -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"password123"}' \
    -c cookies.txt "$HOST/customer/login"

# --- Task 8 : add a book review -------------------------------------------
run reviewadded -X PUT -b cookies.txt \
    "$HOST/customer/auth/review/1?review=This%20book%20is%20a%20masterpiece%20of%20African%20literature."

# --- Task 5 : get the book review -----------------------------------------
run getbookreview "$HOST/review/1"

# --- Task 9 : delete the book review --------------------------------------
run deletereview -X DELETE -b cookies.txt "$HOST/customer/auth/review/1"

# --- shut the server down --------------------------------------------------
kill $SERVER_PID 2>/dev/null
echo "All files written to the '$OUT' directory."
