echo "Getting latest version from Github ..."
git pull
echo "Checking npm install ..."
npm install
echo "Running tests ..."
npm test
echo "Starting bot, printing output to LOG files"
echo "Example check output: 'tail -n 50 OUTPUT.log' and 'tail ERROR.log'"
npm start >> OUTPUT.log 2>ERROR.log