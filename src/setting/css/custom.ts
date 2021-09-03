// language=CSS
export const CustomCss: string = `
html {  height: 100%;}html body {  height: 100%;}html body .container {  height: 100%;}html body .container .columns {  height: 100%;}html body .container .columns .column {  height: 100%;  overflow: scroll;}html body .container .columns .column::-webkit-scrollbar {  display: none;}html body .container .columns .column .badge[data-badge]::after {  font-size: 0.5rem;  height: 0.75rem;}html body .container .columns .column .badge[data-badge].badge-unready::after {  background-color: #f3ae00;}html body .container .columns .column .badge[data-badge].badge-error::after {  background-color: #f00;}html body .container .columns .column .nav {  height: 100%;}html body .container .columns .column .nav .nav {  margin-left: 0.4rem;}html body .container .columns .column .nav .nav-item {  font-size: 0.75rem;  overflow: visible;  text-overflow: ellipsis;  white-space: nowrap;}html body .container .columns .column .nav .nav-item .icon + b {  margin-left: 10px;}html body .container .columns .column .form-item {  border: 0;  border-radius: 5px;  box-shadow: 0 0 10px rgba(0,0,0,0.22);  padding: 15px;}html body .container .columns .column .form-item .form-legend {  font-size: 1.3rem;  font-weight: bold;  padding: 0.5rem !important;  vertical-align: middle;}html body .container .columns .column .form-item .form-legend .icon {  height: 42px;  width: 42px;  vertical-align: middle;}html body .container .columns .column .form-item .form-legend .title {  font-weight: bold;  margin-left: 1.2rem;  vertical-align: middle;}html body .container .columns .column .form-item .form-group .card-description {  color: #808080;  font-size: 0.7rem;  margin-block-start: 10px;  margin-block-end: 10px;  padding: 0 0.8rem;  width: 100%;  word-break: break-word;}html body .container .columns .column .form-item .form-group .setting-item-description {  color: #808080;  font-size: 0.65rem;  padding-bottom: 5px;  width: 100%;  word-break: break-word;}html body .container .columns .column .form-item .form-group .input-group .form-input {  display: inline;  background-color: #fff;}html body .container .columns .column .form-item .form-group .form-input-hint-error {  color: #e85600;  font-size: 0.7rem;}html body .container .columns .column .gap {  height: 8px;}html body .container .columns .column .information-card .icon {  height: 42px;  width: 42px;  vertical-align: middle;}html body .container .columns .column .information-card .title {  font-weight: bold;  margin-left: 1.2rem;}html body .container .columns .column .application-setting-card .icon {  height: 42px;  width: 42px;  vertical-align: middle;  animation: round-icon 5s linear infinite;}html body .container .columns .column .application-setting-card .title {  font-weight: bold;  margin-left: 1.2rem;  vertical-align: middle;}html body .container .columns .column .application-setting-card .form-label {  font-size: 0.75rem;  font-weight: 500;}html body .container .columns .column .application-setting-card .form-label + .form-description {  color: #808080;  font-size: 0.65rem;  width: 100%;  word-break: break-word;}body.dark {  background-color: #2f3031;}body.dark .container,body.dark .card {  background-color: #2f3031;}body.dark .nav .nav-item a,body.dark .form-legend .title,body.dark .form-label,body.dark .information-card .title,body.dark .application-setting-card .title {  color: #dedede;}body.dark .form-item .card-description {  color: #b4b4b4;}body.dark .form-input {  background-color: #3c3c3c !important;  border-color: #464646;  color: #dedede;}body.dark .form-input.is-error {  background-color: #e85600 !important;}body.dark .btn.btn-error {  background: #7d2f00;  border-color: #6d2800;}@-moz-keyframes round-icon {  0% {    transform: rotate(0deg);  }  100% {    transform: rotate(360deg);  }}@-webkit-keyframes round-icon {  0% {    transform: rotate(0deg);  }  100% {    transform: rotate(360deg);  }}@-o-keyframes round-icon {  0% {    transform: rotate(0deg);  }  100% {    transform: rotate(360deg);  }}@keyframes round-icon {  0% {    transform: rotate(0deg);  }  100% {    transform: rotate(360deg);  }}
`