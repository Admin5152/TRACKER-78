// appwriteConfig.js
import { Client, Account } from 'appwrite';

const client = new Client();

client
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // e.g. 'https://cloud.appwrite.io/v1'
  .setProject('683f5658000ba43c36cd'); // Replace with your Appwrite project ID

const account = new Account(client);

export { client, account };
