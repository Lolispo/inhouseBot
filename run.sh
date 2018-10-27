echo "Getting latest version from Github ..."
git pull
echo "Running tests ..."
npm test
echo "Starting bot, printing output to LOG files"
npm start >> OUTPUT.log 2>ERROR.log
# To show Output easy, 'tail -n 50 OUTPUT.log'