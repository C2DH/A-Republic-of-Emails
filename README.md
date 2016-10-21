# A-Republic-of-Emails

A Republic of Emails is a project in which students of the History master at the University of Luxembourg experiment with digital methods/tools on the Hillary Clinton emails. These emails were released as part of a FOIA request (see https://en.wikipedia.org/wiki/Hillary_Clinton_email_controversy#Freedom_of_Information_lawsuits), and subsequently hosted by Wikileaks at https://wikileaks.org/clinton-emails/. To analyse the emails using digital tools, the Wikileaks email archive needs to be scraped to put the emails in an appropriate format. 
The scripts on this GitHub repository can be used to scrape the archive.

# Table of Contents
1. [Installation](#1-installation)
2. [Scraping the Wikileaks email archive](#2-scraping-the-wikileaks-email-archive)
3. [Text normalisation of email contents](#3-text-normalisation-of-email-contents)
4. [Named Entity Recognition of emails contents using Stanford NER](#4-named-entity-recognition-of-emails-contents-using-stanford-ner)
5. [Notes](#5-notes)

# 1. Installation

## Dependencies

Before installation, the scraping script requires Node.js to be installed, see https://nodejs.org/en/download/

## Installing the script

1. Download A-Republic-of-Emails source in a terminal or command line:
    
    git clone https://github.com/C2DH/A-Republic-of-Emails.git
    
2. Change into the `A-Republic-of-Emails` directory:

    cd A-Republic-of-Emails
    
3. Install the Node.js node:

    npm install

# 2. Scraping the Wikileaks email archive

## Usage
In the `settings.js` file, specify the number of emails to be scraped per run [[1]](#5-notes). The default is `10`, but we advise a number between 500-1500. The script counts the number of scraped emails in order to start with the next email.

### Start your engines :)
Launch the main script:

    node index.js

and wait for the process to be completed.

### Validation
Sometimes, some emails may not be scraped correctly due to time-out errors. To check your database, change the number of emails to be scraped in the `settings.js` file to `10` and run the script again with:

    node index.js

The script will run through all the scraped emails and scrape missing emails. If you get the error `TypeError: Cannot read property 'split' of undefined` this means there are no more emails to be scraped.

## Results
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

# 3. Text normalisation of email contents

After scraping, we can perform text normalisation of the email texts (the separate `.txt` files), the `stemmer.js` script will perform the following steps:

1. Tokenising of all the words
2. Lowercasing of all words
3. Removal of numeric values
4. Stem the words using UEA-lite [[2]](#5-notes)
5. Removal of stopwords [[3]](#5-notes)

## Usage

To launch the stemming script, change into the `A-Republic-of-Emails` directory (if you were not there already):

    cd A-Republic-of-Emails

And run `stemmer.js`

    node stemmer.js
    
## Results

The normalised emails are saved as separate `.txt` files in a subfolder of the folder containing emails. Thus all emails of the `/contents/f-0` folder are normalised and saved into `/contents/f-0/stems`, etc.

## Advanced options

-If you do not want to perform step 2. Lowercasing of all words, comment out line 29 in `stemmer.js` and uncomment line 30
-If you do not want to perform step 5. Removal of stopwords, comment out line 36 in `stemmer.js`

# 4. Named Entity Recognition of emails contents using Stanford NER

Another course of action to take after scraping is Named Entity Recognition (NER), so that we can create a list of mentioned people, places, or organizations. 

## Dependencies

In order to perform Named Entity Recognition, the Stanford NER toolkit needs to be on your computer, see http://nlp.stanford.edu/software/CRF-NER.shtml#Download. Before continuing, please test the Stanford NER using the readMe file in the extracted folder.

## Usage

To load the NER classifier, drag the `ner-server.sh` file into the stanford NER folder[[4]](#5-notes). After doing so, change into the stanford NER folder. For example, if you have called this folder stanfordNER, then:
   
    cd stanfordNER

And run `ner-server.sh`:

    ./ner-server.sh
    
Open a **new terminal window** and change into the `A-Republic-of-Emails` directory there:
   
    cd A-Republic-of-Emails

Update the scripts:

    npm update
    
And run `stanfordNER.js`

    node stanfordNER.js
    
The stanfordNER will run the 7 class model:	Location, Person, Organization, Money, Percent, Date, Time. However, we will export only the first three types: Location, Person, Organization, to a CSV file. To do so run `tags.js`

    node tags.js

## Results

First, the `stanfordNER.js` script will store all named entities (NEs) per email as separate `.json` files in a subfolder of the folder containing emails. Thus all emails of the `/contents/f-0` folder are normalised and saved into `/contents/f-0/NER`, etc.
Second, the `tags.js` script will load these `.json` files and store the Location, Person, Organisation NE types in `export.ner.csv` which contains the following columns:

1. `url` (The Wikileaks URL)
2. `src` (The location of the `.txt` file
3. `data` (empty)
4. `From` (The sender of the email)
5. `To` (The receiver of the email)
6. `Subject` (The email title)
7. `Date` (The date and time of sending the email)
8. `locations` (Locations mentioned in the email)
9. `people` (People mentioned in the email)
10. `organizations` (Organizations mentioned in the email)

All named entities per column are pipe-separated `|`

# 5. Notes

1. The scraper is gratefully based on the [sandcrawler.js library](https://github.com/medialab/sandcrawler) created by Guillaume Plique from [SciencePo’s Medialab](http://www.medialab.sciences-po.fr/)
2. The stemming script is based on [UEA-lite](http://www2.cmp.uea.ac.uk/~djs/projects/UEAlite/stemmer.html), and is based on the [Talisman library](http://yomguithereal.github.io/talisman/) created by Guillaume Plique from [SciencePo’s Medialab](http://www.medialab.sciences-po.fr/)
3. The list of stopwords is taken from the default english stopwords list provided by [RANKS NL](http://www.ranks.nl/stopwords) 
4. `ner-server.sh` is an adaptation from the original [`ner-server.sh`](https://github.com/niksrc/ner/blob/master/ner-server.sh) by [Nikhil Srivastava](https://niksrc.github.io/)
