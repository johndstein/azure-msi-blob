# azure-msi-blob

Simple library to get and put files to Azure blob storage.

We assume your virtual machine and storage account are configured to use Azure
Managed Service Identity (MSI) so you don't need any credentials to access
storage from your VM.

https://docs.microsoft.com/en-us/azure/active-directory/msi-tutorial-linux-vm-access-storage

The key thing we do is get your `AZURE_STORAGE_ACCESS_KEY`. This allows you to
access blob storage without any credentials both in Node.js and the `azure-cli`.

## Installation

```
npm install -g azure-msi-blob
```

## Node.js Module Usage

```
// All opts are optional. We fallback to the environment variables
// described below.

const opts = {
  subscriptionId: '42d18e54-a416-42fd-859c-45d9k4mfuyue3',
  resourceGroup: 'some-resource-group',
  accountName: 'myStorageAccount'
};

const storage = require('azure-msi-blob')(opts);

storage.get(
  'some-container',
  'some/blob/object.txt',
  'somefile.txt',
  function(err) {
    // if no error your file will be on the local file system.
    console.log(err);
  });

storage.put(
  'some-container',
  'some/blob/object.txt',
  'somefile.txt',
  function(err) {
    // if no error your file is safely in blob storage.
    console.log(err);
  });
```

## Command Line Usage

The following environment variables are required for command line usage.

```
export AZURE_SUBSCRIPTION_ID=9di38e54-a416-42fd-859c-9dh4723h010e3
export AZURE_RESOURCE_GROUP=my_resource_group
export AZURE_STORAGE_ACCOUNT=storage_account_name
```

### Get a file from blob storage.

```
getblob CONTAINER BLOB FILE
```

### Put a file to blob storage.

```
putblob CONTAINER BLOB FILE
```

### Get the Azure Storage Access Key

Write the access key to `STDOUT`.

```
getkey
```

## Azure Command Line Utility

If you set the `AZURE_STORAGE_ACCESS_KEY` environment variable you can use
`azure-cli` to do anything you want with your storage (assuming the
`AZURE_STORAGE_ACCOUNT` environment variable is also set).

```
export AZURE_STORAGE_ACCESS_KEY=$(getkey)
```

**create a container**

```
az storage container create --name some_container
```

**delete a container**

```
az storage container delete --name some_container
```