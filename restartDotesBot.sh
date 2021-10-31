#!/bin/bash
echo "Restarting Dotes bot ..."
tmux kill-session -t dota
# echo "Killed session, starting new ..."
tmux new-session -d -s dota
# echo "Sessions alive ..."
# tmux ls
# echo "Starting dotes bot ..."
tmux send-keys -t dota "cd ~/Projects/DotesBot" Enter
tmux send-keys -t dota "sh ./StartBot" Enter