const strTmpWithCss = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
      div {
        color: red;
      }
    </style>
  </head>
  <body><div id="inner">子应用的代码</div></body>
  </html>
`;

const strScript = `
  window.a = 100; // 此属性不会影响父应用
  console.log(window.a);
  const ele = document.querySelector('#inner');
  console.log(ele);
`;

export {
  strScript,
  strTmpWithCss
}