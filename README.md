# single-page-template
Gulp workflow for LESS and ecmascript6. Minify, transpile, livereload.  

# Setup
1. Fork  
2. Install live reload: https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei  
   Install npm: https://nodejs.org/download/  
   Install gulp: https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md  
3. Command line to root folder, run `gulp` and/or `gulp production`  

`gulp`
  watches /src -> compiles to /debug  
  process/transpile, livereload
  
`gulp production`
  watches /src -> compiles to /  
  process/transpile, strip console logs, minify, livereload
