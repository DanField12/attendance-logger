# attendance-logger

This is a system for logging attendance to a church service. Can also be used to print nametags
to a brother QL-810W printer. Any other printers will require their own program.

## todo
- add tests
- Send new user requests to Elvanto using the API
- Fix the admin password
- rewrite the frontend using react
- Add support for signing in kids
  - Support for new kids

## How To Use
1. In the releases, download and unzip the printer-app.zip file.
2. Download and install the B-PAC SDK from [Here](https://support.brother.com/g/s/es/dev/en/bpac/download/index.html?c=eu_ot&lang=en&navi=offall&comple=on&redirect=on)
3. Download and install the printer driver from [Here](https://support.brother.com/g/b/downloadtop.aspx?c=au&lang=en&prod=lpql810weas)
4. Inside the printer-app directory, update the start batch file with your ip. 