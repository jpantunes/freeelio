module.exports = function () {
    class SolshareApi {
        static getCredentials () {
            return {
                username: "008801111111987",
                password: "free2018lio",
            };
        };

        static getDonationBoxesUrl () {
            let credentials = this.getCredentials();
            let url = "https://";
            url += credentials.username + ":" + credentials.password + '@';
            url += 'api.me-solshare.com/api/v1/solbox/donation_boxes';

            return url;
        }

        static getDonationBoxes(callback) {
            let request = require('request');
            request({url: SolshareApi.getDonationBoxesUrl(), json:true}, function (error, response, body) {
                let solboxes = Object.keys(body[1].solboxes).map(function (key) {
                    return Object.values(body[1].solboxes[key]);
                });

                /* Returning array with values:
                solbox_id,
                grid_id,
                amount_of_energy_bought_in_last_30_days,
                total_bought_in_last_30_days,
                recharge_amount_to_be_allocated
                 */
                return callback(solboxes);
            });
        }
    }

    return SolshareApi;
};