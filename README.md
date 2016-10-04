# A-Republic-of-Emails

A Republic of Emails is a project in which students of the History master at the University of Luxembourg experiment with digital methods/tools on the Hillary Clinton emails. These emails were released as part of a FOIA request, and subsequently hosted by Wikileaks at https://wikileaks.org/clinton-emails/. To analyse the emails using digital tools, the Wikileaks email archive needs to be scraped to put the emails in an appropriate format. 
The scripts on this GitHub repository can be used to scrape the archive.

## Installation

Before installation, the scraping script requires Node.js to be installed, see https://nodejs.org/en/download/

1. Download A-Republic-of-Emails source in a terminal or command line:
    
    `git clone https://github.com/C2DH/A-Republic-of-Emails.git`
    
2. Change into the `A-Republic-of-Emails` directory:

    `cd A-Republic-of-Emails`
    
3. Install the Node.js node:

    `npm install`
    

# Usage
In the `settings.js` file, specify the number of emails to be scraped per run. The default is 10, but we advise a number between 500-1500. The script counts the number of scraped emails in order to start with the next email.

## start your engines :)
Launch the main script:

    node index.js

and wait for the process to be completed.

