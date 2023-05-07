# Bloglite

> Bloglite is a user-friendly social networking web application that enables users to create and share photos and stories with others. Built with Flask and Vue.js, the application offers a simple and intuitive interface to allow users to stay connected with their followers. It also features automated monthly reports and notifications using webhooks for a seamless user experience.

## Installation

**Prerequisites**

Before you can install and run this app, you must have the following software installed on your system:

- Python 3.x
- Flask
- Flask_sqlalchemy
- Vue.js
- Celery 
- Redis

 Installing Dependencies
```sh
pip install -r requirements.txt
```
To run the Bloglite app, you will need to follow these steps:

- Ensure that the database.db file is located in the same directory as main.py, as well as the templates and static folders.

- Open three terminals on WSL, and navigate to the Bloglite directory.

- In the first terminal, start the Redis server by typing redis-server.

- In the second terminal, activate the virtual environment by running source venv/bin/activate. Then, start the Celery worker by typing celery -A main worker -l info.

- In the third terminal, activate the virtual environment by running source venv/bin/activate. Then, start the Flask app by typing python main.py.

- After the third step, you should see the message "Running on http://127.0.0.1:5000/" in the terminal. Navigate to this URL in your web browser to access the Bloglite app.

## Usage example

**Creating a New Post**

To create a new post, navigate to the profile page and click the "Create" button. This will open the post creation form. Enter a title and description for your post, and upload an image. Once you're done, click the "Post" button to publish your post.

**Editing and Deleting Posts**

To edit a post, navigate to the post you want to edit and click the "Edit" button. This will open the post edit form where you can make changes to the post's title, caption, or image. Once you're done, click the "Save" button to update the post.

To delete a post, navigate to the post you want to delete and click the "Delete" button. This will delete the post permanently. Please note that this action cannot be undone, so be sure to confirm that you want to delete the post before proceeding.

**Following Other Users**

One of the key features of Bloglite is the ability to follow other users and see their activity on the platform. To follow another user, simply navigate to the search page and click the "Follow" button. This will add their posts to your activity feed.

**Automated Monthly Reports and Notifications**

Bloglite includes automated monthly reports that are sent via email to users. To enable this feature, you will need to set up a Celery task that generates the report and sends it using your email service provider.

Additionally, Bloglite sends notifications to users who haven't posted in the past 24 hours. This is also implemented using Celery and Redis.

**Importing and Exporting Posts**

You can easily import and export posts using the CSV format. To import a CSV file, navigate to the profile page and click on the Import button. Select the file you want to upload. The posts in the file will be added to your profile.

To export posts in CSV format, navigate to the post you want to export and click the "Export" button. The posts will be downloaded as a CSV file.

The import and export functionality of Bloglite is implemented using Celery and Redis, allowing users to easily export their posts to a CSV file or import new posts from a CSV file.

**Editing and Deleting Your Account**

To edit or delete your account, go to the account  page and click the "Edit" or "Delete" button. This will bring up a confirmation message, and upon confirming the action, your account will be updated or removed from the platform.

## Release History

* 1.0.0
    * Initial release of the app.
    * Includes basic functionality for posting 
    * pictures and captions, following other users, and viewing activity feeds.
    * Provides search functionality.
    * Has improved user interface and several new customization options.
    * Fixes several bugs, improved error handling, security vulnerabilities, and accessibility issues.

## Meta

Mehak – 21f1006390@ds.study.iitm.ac.in

Distributed under the IITM license. See ``LICENSE`` for more information.
