#!/usr/bin/env bash
# build-loop.sh
# A guarded local automation loop: implement -> test -> fix -> retest.
# Stops after MAX_ITERATIONS to prevent runaway agent behavior.
# Never touches main or development directly -- run this on a feature/* branch.

set -euo pipefail

MAX_ITERATIONS=5
TASK_DESCRIPTION="${1:?Usage: ./scripts/build-loop.sh \"task description\"}"
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [[ "$BRANCH" == "main" || "$BRANCH" == "development" ]]; then
  echo "❌ Refusing to run build-loop on '$BRANCH'. Switch to a feature/* branch first."
  exit 1
fi

echo "🔁 Starting build loop on branch: $BRANCH"
echo "📋 Task: $TASK_DESCRIPTION"

for i in $(seq 1 "$MAX_ITERATIONS"); do
  echo ""
  echo "=== Iteration $i/$MAX_ITERATIONS ==="

  if [[ $i -eq 1 ]]; then
    PROMPT="$TASK_DESCRIPTION. Follow AGENTS.md rules exactly. Write or update tests
    FIRST, then implement. After implementing, run the test suite yourself and report
    pass/fail."
  else
    PROMPT="The previous attempt at: '$TASK_DESCRIPTION' failed tests. Here is the test
    output:
    ---
    $LAST_TEST_OUTPUT
    ---
    Fix the implementation (not the tests, unless the test itself is wrong) and report
    back."
  fi

  # Headless, auto-approved run -- safe because permissions in opencode.json
  # already deny destructive git commands (force-push, rebase) by default.
  opencode run "$PROMPT" -q

  echo "🧪 Running test suite..."
  if npm run test > /tmp/build-loop-test-output.txt 2>&1; then
    echo "✅ Tests passed on iteration $i."
    git add -A
    git commit -m "feat: $TASK_DESCRIPTION (auto-loop, iteration $i)"
    echo "✅ Committed. Review the diff before merging to development."
    exit 0
  else
    echo "❌ Tests failed. Feeding output back for iteration $((i+1))."
    LAST_TEST_OUTPUT=$(cat /tmp/build-loop-test-output.txt)
  fi
done

echo ""
echo "⚠️  Reached $MAX_ITERATIONS iterations without passing tests."
echo "⚠️  Stopping for human review -- do not keep looping blindly."
exit 1
