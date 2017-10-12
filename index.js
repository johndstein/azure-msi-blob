#!/usr/bin/env node

'use strict';

const get = require('simple-get');
const azure = require('azure-storage');
const fs = require('fs');

exports = module.exports = function(opts) {
  return new Blob(opts);
};

class Blob {
  constructor(opts) {
    opts = opts || {};
    this.subscriptionId = opts.subscriptionId || process.env.AZURE_SUBSCRIPTION_ID;
    this.resourceGroup = opts.resourceGroup || process.env.AZURE_RESOURCE_GROUP;
    this.accountName = opts.accountName || process.env.AZURE_STORAGE_ACCOUNT;
    this.accessToken = null;
    this.accessKey = null;
    this.blobService = null;
  }
  get(container, blob, file, cb) {
    this.getAccessKey(function(err) {
      if (err) {
        cb(err);
      } else {
        this.blobService.getBlobToStream(
          container,
          blob,
          fs.createWriteStream(file),
          function(err) {
            cb(err);
          });
      }
    }.bind(this));
  }
  put(container, blob, file, cb) {
    this.getAccessKey(function(err) {
      if (err) {
        cb(err);
      } else {
        this.blobService.createBlockBlobFromLocalFile(
          container,
          blob,
          file,
          function(err) {
            cb(err);
          });
      }
    }.bind(this));
  }
  getAccessToken(cb) {
    if (!this.accessToken) {
      const opts = {
        url: 'http://localhost:50342/oauth2/token',
        json: true,
        headers: {
          Metadata: 'true'
        },
        form: {
          resource: 'https://management.azure.com/'
        }
      };
      get.concat(opts, function(err, res, data) {
        if (err) {
          cb(err);
        } else {
          this.accessToken = data.access_token;
          cb(null, this.accessToken);
        }
      }.bind(this));
    } else {
      cb();
    }
  }
  getAccessKey(cb) {
    this.getAccessToken(function(err) {
      if (err) {
        cb(err);
      } else {
        if (!this.accessKey) {
          const opts = {
            url: `https://management.azure.com/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroup}/providers/Microsoft.Storage/storageAccounts/${this.accountName}/listKeys?api-version=2016-12-01`,
            method: 'POST',
            json: true,
            headers: {
              Authorization: 'Bearer ' + this.accessToken
            }
          };
          get.concat(opts, function(err, res, data) {
            if (err) {
              cb(err);
            } else {
              this.accessKey = data.keys[0].value;
              this.blobService =
                azure.createBlobService(this.accountName, this.accessKey);
              cb(null, this.accessKey);
            }
          }.bind(this));
        } else {
          cb();
        }
      }
    }.bind(this));
  }
}