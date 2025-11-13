#!/bin/bash

ROOT_DIR=$(pwd)
PERSIST_FILE="$ROOT_DIR/.tmp/.todo-folder"

# If persistence file exists, read from it
if [ -f "$PERSIST_FILE" ]; then
    SAVED_FOLDER=$(cat "$PERSIST_FILE")
fi

# If a folder was passed from VS Code, use it.
# Otherwise fallback to saved folder.
TARGET_FOLDER="${1:-$SAVED_FOLDER}"

if [ -z "$TARGET_FOLDER" ]; then
    echo "ERROR: No folder provided and no persisted folder found."
    exit 1
fi

# Persist the new folder if different
echo "$TARGET_FOLDER" > "$PERSIST_FILE"

TODO_DIR="$ROOT_DIR/todo/$TARGET_FOLDER"

# Date format like your files: MM-DD-YY.md (e.g. 05-19-25.md)
date_fmt="+%m-%d-%y"

# Function to get formatted date + N days
get_date() {
  date -d "+$1 day" "$date_fmt"
}

# Find the first day from 0 onward that does NOT exist as a todo file
day_offset=0
while true; do
  candidate_date=$(date -d "+$day_offset day" "$date_fmt")
  candidate_file="$TODO_DIR/$candidate_date.md"
  if [ ! -f "$candidate_file" ]; then
    break
  fi
  ((day_offset++))
done

# Create the new todo.md file with a header (optional)
echo "# TODO for $candidate_date" > "$candidate_file"

# Open in VSCode
code "$candidate_file"
