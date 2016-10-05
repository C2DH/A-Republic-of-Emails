# A-Republic-of-Emails

A Republic of Emails is a project in which students of the History master at the University of Luxembourg experiment with digital methods/tools on the Hillary Clinton emails. These emails were released as part of a FOIA request (see https://en.wikipedia.org/wiki/Hillary_Clinton_email_controversy#Freedom_of_Information_lawsuits), and subsequently hosted by Wikileaks at https://wikileaks.org/clinton-emails/. To analyse the emails using digital tools, the Wikileaks email archive needs to be scraped to put the emails in an appropriate format. 
The scripts on this GitHub repository can be used to scrape the archive.

# Installation

## Dependencies

Before installation, the scraping script requires Node.js to be installed, see https://nodejs.org/en/download/

## Installing the script

1. Download A-Republic-of-Emails source in a terminal or command line:
    
    `git clone https://github.com/C2DH/A-Republic-of-Emails.git`
    
2. Change into the `A-Republic-of-Emails` directory:

    `cd A-Republic-of-Emails`
    
3. Install the Node.js node:

    `npm install`
    

# Usage
In the `settings.js` file, specify the number of emails to be scraped per run. The default is `10`, but we advise a number between 500-1500. The script counts the number of scraped emails in order to start with the next email.

## Start your engines :)
Launch the main script:

    node index.js

and wait for the process to be completed.

## Validation
Sometimes, some emails may not be scraped correctly due to time-out errors. To check your database, change the number of emails to be scraped in the `settings.js` file to `10` and run the script again with:

`node index.js`

The script will run through all the scraped emails and scrape missing emails.

# Results
The script will save the contents of the emails in separate `.txt` files in the `contents` folder in separate folders per 1,000 emails, from `f-0` to `f-30`. These folders are automatically created.

The metadata of the emails are saved in `export.csv` and `export.json`, which contain the exact same data:

1. `url` (The Wikileaks URL)
2. `src` (The location of the `.txt` file
3. `data` (empty)
4. `From` (The sender of the email)
5. `To` (The receiver of the email)
6. `Subject` (The email title)
7. `Date` (The date and time of sending the email)
8. `contents` (empty)
