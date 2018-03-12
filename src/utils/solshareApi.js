function getCredentials() {
    return {
        username: "008801111111987",
        password: "free2018lio",
    };
}

function getDonationBoxesUrl() {
    let url = "https://";
    url += 'api.me-solshare.com/api/v1/solbox/donation_boxes';

    return url;
}

export function getDonationBoxes(callback) {
    let credentials = getCredentials();

    fetch(getDonationBoxesUrl(), {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa(credentials.username + ':' + credentials.password),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    })
        .then(dataWrappedByPromise => dataWrappedByPromise.json())
        .then(response => {
            let solboxes = Object.keys(response[1].solboxes).map(function (key) {
                return Object.values(response[1].solboxes[key]);
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
