class ip_agent_utils {

}

ip_agent_utils.getAgent = function() {
    let userAgent = window.navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) {
        return {type: 1, agent: 'Android'};
    } else if (/(iphone|ipad|ipod|ios)/i.test(userAgent)) {
        return {type: 2, agent: 'iOS'};
    } else {
        return {type: 3, agent: 'Browser'};
    }
};

export {ip_agent_utils};
