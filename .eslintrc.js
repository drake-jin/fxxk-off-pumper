module.exports = {
    'extends': 'airbnb',
    'rules': {
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'object-curly-newline': 'off', // new line 하기 싫다.
  
      'react/jsx-filename-extension': 'off', // jsx는 따로 확장자명을 두고 써라
      'react/no-render-return-value': 'off', // { }없으면 그냥 리턴인데 자꾸 리턴하라해서 끔
  
      'no-unused-vars': 'warn',
  
      // 앞에 절대경로 쓰기 싫음. - - 
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      'import/first': 'off',
      'import/no-extraneous-dependencies': 'off',
  
      // UI/UX 처리하는대에 있어 모든 값에 전부 id 가 붙지 않을 수 도 있음. 그냥 index나 드세여 ...
      'react/no-array-index-key': 'off',
  
      'jsx-a11y/no-static-element-interactions': 'off',
      'react/jsx-curly-brace-presence': 'off', // 속성에 들어갈 문자열이 길어서 템플릿 리터럴을 쓰는데 .. 자꾸 못쓰게함
      //이건 나중에 실제 업무에서 사용할 때 쓰는것이 좋겠다.
      'react/prop-types': 'off', // 속성값을 반드시 지정해야한다.
      'jsx-a11y/click-events-have-key-events': 'off', // 클릭이벤트를 만들었으면 키보드이벤트도 같이 넣어서 마우스만 컨트롤 하는게 아닌 키보드 컨트롤도 가능하게끔 
    },
    'env': {
      'browser': true,
    }
  };