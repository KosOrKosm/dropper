# Dropper
Dropbox-like service in AWS. Created for CPSC 454.

![image](https://user-images.githubusercontent.com/46112489/205513020-b31bedaa-bf8a-4e56-b78a-17f3e944902e.png)

## Installation (Local)

### Prerequisites
* [Node.JS](https://nodejs.org/)
* [AWS Account w/ DynamoDB and S3](https://aws.amazon.com/)

### Instructions
1. Navigate to the AWS SDK credentials folder. 
    1. On Windows, run 'cd %USERPROFILE%/.aws'
    2. On Unix-like systems, run 'cd ~/.aws'
    3. If the folder does not exist, you may create it
2. Create a credential file [in according with the AWS SDK's format requirements](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html)
3. Clone the repository to a location on your local machine.
4. Open the command prompt and navigate to the clone location.
5. Run 'npm install'
6. Wait for all dependencies to be downloaded.
7. Run 'npm start'
8. The server should now begin executing in the command prompt. Navigate to http://localhost:3000 to test.

## Installation (AWS Cloud)

### Prerequisites
* [Python](https://www.python.org/)
* [Amazon Elastic Beanstalk CLI](https://github.com/aws/aws-elastic-beanstalk-cli-setup)
* [AWS Account w/ DynamoDB and S3](https://aws.amazon.com/)

### Instructions
1. Clone the repository to a location on your local machine.
2. Open the command prompt and navigate to the clone location.
3. Run 'eb init' and create an application for Dropper.
    1. Ensure Elastic Beanstalk creates a Node application.
    2. Set the name to whatever you like.
4. Run 'eb create' to deploy the server to the cloud.
5. The server should now be executing in your AWS environment. Run 'eb open' to test.
6. Run 'eb terminate' to shut down the server when finished.

