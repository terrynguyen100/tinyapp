# TinyApp Project

TinyApp is a full stack web application built with Node.js and Express that allows users to shorten long URLs, similar to popular services like bit.ly. With TinyApp, users can easily register, manage their own collection of short links, and conveniently share them with others.

## Final Product

!["Screenshot of Registration Page"](https://github.com/terrynguyen100/tinyapp/blob/ed0846cf7fcc1193751836564dad8aa725eb117b/docs/Screenshot%20of%20register%20page.jpg)
!["screenshot of New URL Page"](https://github.com/terrynguyen100/tinyapp/blob/ed0846cf7fcc1193751836564dad8aa725eb117b/docs/Screenshot%20of%20new%20url%20page.jpg)
!["screenshot of URLs Page"](https://github.com/terrynguyen100/tinyapp/blob/ed0846cf7fcc1193751836564dad8aa725eb117b/docs/Screenshot%20of%20urls%20page.jpg)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

1. [Create](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) a new repository using this repository as a template.
2. Clone your repository onto your local device.
3. From your terminal, install dependencies using the `npm install` command.
3. Start the web server using the `node express_server.js`
4. Go to <http://localhost:8080/> in your browser.

## How To Use TinyApp

#### Register/Login
Users must be logged in to create new short links, view and edit them.

To register, click Register at the top right, enter your email and password.

#### Create New Links

Once logged in, on the top navigation bar, click on Create New URL to add new links.

Simply enter the long URL that you would like to shorten in the textbox, then Submit.

#### Edit or Delete Short Links

In My URLs, you can delete any links by clicking on the Delete button.

If you would like to edit, click on Edit button of the link and you will be redirected to a page to enter the new link.

#### Use Your Short Link

The generated short link will be localhost:8080/u/:shortLink.

For example, if the short link is abcdef, then the short URL will be localhost:8080/u/abcdef.
