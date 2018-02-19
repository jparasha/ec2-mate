
//Set Folowing Environment variables in Lambda.
//INACTIVE_TERMINATION_DAYS : {{x Days}}
//FORCED_INACTIVE_TERMINATION_DAYS : {{y Days}}
//TERMINATION_DRY_RUN : {{false}} If not dry running
// x Days: Days after which instances will be terminated
// y days: Days after which instances will be forced terminated even if DoNotTerminate is true for EC2 Instance Tag


//Set following tag for ec2 instances if INACTIVE_TERMINATION_DAYS has to be bypassed
//DoNotTerminate : true


const AWS = require('aws-sdk');
const date = require('./lib/getDateDiff');
const reg = require('./data/regions.json');
const terminate = require('./lib/terminate');
const stop = require('./lib/stop');
exports.handler = function (event, context) {
    var regionNames = [];
    for (var key in reg) {
        if (reg.hasOwnProperty(key)) {
            regionNames.push(reg[key]);
        }
    }

    // asynchronously calling functions across regions
    regionNames.forEach(function (region) {

        const ec2 = new AWS.EC2({ region: region });

        // terminate Instances, which are inactive for environment Variable {INACTIVE_TERMINATION_DAYS}.
        var terminateInactiveInstances = terminate.terminateInstances(ec2, region, date);

        //stop instances tagged with "OFFICEHOURSTAGGEDSHUTDOWN" and additionaly add the same tag if not already present.
        var tagAndStopInstancesDaily = stop.tagAndStopInstancesDaily(ec2, region);

    });

}; //exports handler
