exports.getStopDate = (initialDate) => {
    //console.log('args:'+ initialDate);
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;
    var expirationData = {};
    var a = new Date();
    var b = new Date(initialDate);
    var remainingDays = dateDiffInDays(a, b);
    var inactive = +process.env.INACTIVE_TERMINATION_DAYS;

    function dateDiffInDays(a, b) {
        // Discard the time and time-zone information.
        var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
        expirationData.days = -(Math.floor((utc2 - utc1) / _MS_PER_DAY));

        if (expirationData.days > +process.env.INACTIVE_TERMINATION_DAYS) {
            expirationData.flag = true;
        }
        else if (+process.env.INACTIVE_TERMINATION_DAYS == undefined || +process.env.INACTIVE_TERMINATION_DAYS == null){
           expirationData.flag =false;
           console.log("No environment Variable INACTIVE_TERMINATION_DAYS found !");
        }
        else {
            expirationData.flag = false;
        }

        return expirationData;
    }
    return remainingDays;

};
