# Squid Proxy

Web-Caching Protocol Written using Node.JS to act as a web proxy for html pages.

The proxy has the ability to handle mulitple requests concurrently from multiple sources

## Dependencies
You will need to have node.js installed to run

The following modules are required (not an exhaustive list)

1.  Express
2.  Nodemon
3.  http
4.  net
5.  url

## Running the proxy

You will need to set a proxy to listen on 127.0.0.1:9393.

Clone this repository.

Use `nodemon test` to run

## Blacklisting websites.

To blacklist a website you can either:

1.  Add the websites you want to blacklist to the *websites.json* file
2.  You can enter the address of the website you blacklist into the command line (eg. To block "bob.com" enter: bob.com and www.bob.com)

To remove a blacklist do the opposite as from above


