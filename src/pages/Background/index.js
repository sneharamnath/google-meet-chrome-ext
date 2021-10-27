chrome.identity.getAuthToken({
    interactive: true
}, (token) => {
    console.log(token);
    if (!chrome.runtime.lastError) {
        let url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token;
        fetch(url).then((response) => response.json())
        .then((data) => {
            console.log(data);
            chrome.storage.sync.set({
                userData: data
            })
        })
    }
});

//Shortcuts event handler
chrome.commands.onCommand.addListener((command) => {
    if (command === 'create-meeting') {
        createGoogleMeet();
        chrome.runtime.sendMessage({
            msg: 'meet_btn_press',
        });
    }
    if (command === 'copy-google-meet-id') {
        chrome.runtime.sendMessage({
            msg: 'copy_meet_id',
        });
    }
    if (command === 'switch-account') {
        switchUser();
    }
})

//Chrome runtime event handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'create-meet') {
        createGoogleMeet();
    }
    if (message === 'change-user') {
        switchUser();
    }
})


function createGoogleMeet() {
    chrome.identity.getAuthToken({
        interactive: true
    }, (token) => {
        console.log(token);

        let startDate = new Date();
        let endDate = new Date(startDate.getTime() + 3600000);
        let isoStartDate = new Date(
                startDate.getTime() - new Date().getTimezoneOffset() * 60 * 1000
            )
            .toISOString()
            .split('.')[0];
        let isoEndDate = new Date(
                endDate.getTime() - new Date().getTimezoneOffset() * 60 * 1000
            )
            .toISOString()
            .split('.')[0];
        //details about the event
        let event = {
            summary: 'Create Google meet Meeting',
            description: 'Google Meeting created using a chrome extension GMeet',
            start: {
                dateTime: `${isoStartDate}`,
                timeZone: 'Asia/Kolkata',
            },
            end: {
                dateTime: `${isoEndDate}`,
                timeZone: 'Asia/Kolkata',
            },
            conferenceData: {
                createRequest: {
                    requestId: '7qxalsvy0e'
                },
            },
        };

        let fetch_options = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        };

        fetch(
                'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
                fetch_options
            )
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                chrome.storage.sync.set({
                    meetID: data.hangoutLink
                }, () => {
                    console.log('Hangout Link ' + data.hangoutLink);
                });
                chrome.storage.sync.set({
                    email: data.creator.email
                }, () => {
                    console.log('Creator Link ' + data.creator.email);
                });
                chrome.runtime.sendMessage({
                    msg: 'google_meet_link_created',
                    meetID: data.hangoutLink,
                    email: data.creator.email,
                });
            });
    });
}

function switchUser() {
    chrome.identity.getAuthToken({
        interactive: true
    }, (token) => {
        console.log(token);
        if (!chrome.runtime.lastError) {
            let url = 'https://accounts.google.com/o/oauth2/revoke?token=' + token;
            fetch(url).then(() => {
                chrome.identity.removeCachedAuthToken({
                    token: token
                }, () => {
                    chrome.identity.getAuthToken({
                        interactive: true
                    }, (token) => {
                        let url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token;
                        fetch(url).then((response) => response.json())
                        .then((data) => {
                            console.log(data);
                            chrome.storage.sync.set({
                                userData: data
                            })
                        })
                        chrome.runtime.sendMessage({
                            msg: 'user_changed',
                        });
                    });
                });
            });
        }
    });
}