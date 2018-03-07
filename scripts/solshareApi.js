module.exports = function (request) {
    class SolshareApi {
        static getCredentials () {
            return {
                username: "008801111111987",
                password: "free2018lio",
            };
        };

        static getDonationUrl () {
            let credentials = this.getCredentials();
            let url = "https://";
            url += credentials.username + ":" + credentials.password + '@';
            url += 'api.me-solshare.com/api/v1/solbox/donation';

            return url;
        }

        static getDonationBoxesUrl () {
            let credentials = this.getCredentials();
            let url = "https://";
            url += credentials.username + ":" + credentials.password + '@';
            url += 'api.me-solshare.com/api/v1/solbox/donation_boxes';

            return url;
        }

        static getDonationBoxes() {
            request({url: SolshareApi.getDonationBoxesUrl(), json:true}, function (error, response, body) {
                return body[1].solboxes;
            });
        }

        static getDonations() {
            request({url: SolshareApi.getDonationBoxesUrl(), json:true}, function (error, response, body) {
                console.log(body[0].donations);
                return body[0].donations;
            });
        }
    }

    return SolshareApi;
};