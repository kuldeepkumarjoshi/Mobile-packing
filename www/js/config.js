angular.module("woocommerce-api").constant("CONFIG", {

    // The url of your domain, both HTTP and HTTPS are supported.

     site_url:'http://localhost/packing',
    // site_url:'http://packnation.in',
  //  site_url:'http://packnation-test.goldenpotli.com',

    // Max period of time to wait for reply from the server, defined in milliseconds.
    request_timeout: 6000,

    // The url that follows your main domain, the API version is of interest here, v3 is the latest.
    wc_api_endpoint: '/index.php/wc-api/v3',

    // Pair of credentials from your woocommerce installation, please refer to the documentation.
    // Apps today
    // local
    wc_consumer_key:'ck_96a65e7ddbfbe121d6dd0154c3283c616b6b8808',
    wc_consumer_secret:'cs_c681dd0aa5733843b39436bba97e7ec92f59988b',

    // wc_consumer_key: 'ck_c2067bb22f8163849bb71faedfccff83b4cd5394',
    // wc_consumer_secret: 'cs_03525c2eab4492f415bf6e2456bdaeeac199d77e',

    // The number of products to be fetched with each API call.
    products_per_page: 6,

    // The number of reviews to be fetched with each API call.
    reviews_per_page: 6,

});
