cd generate-grammar

../node_modules/.bin/babel index.ts --out-file grammar.js --presets @babel/preset-typescript

cd ../monkeys

../node_modules/.bin/babel empty.js --out-file ../random.js



