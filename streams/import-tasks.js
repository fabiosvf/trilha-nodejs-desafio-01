import fs from 'fs';
import { parse } from 'csv-parse';

const stream = fs.createReadStream('./streams/tasks.csv');

const parser = parse({
  columns: true,
  skip_empty_lines: true
});

stream.pipe(parser);

parser.on('data', async (row) => {
  const postData = {
    title: row.title,
    description: row.description
  };

  try {
    const response = await fetch('http://localhost:3333/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    if (response.ok)
      console.log('Successful');
    else
      console.log('Fail');

  } catch (error) {
    console.log('Error')
  }
});

parser.on('end', () => {
  console.log('Process completed');
});