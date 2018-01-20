exports.terminateInstances = (ec2, region, date) => {
    //console.log('terminateInstances Called');
    var pushData = [];
    var params = {
        Filters: [{
            Name: 'instance-state-name',
            Values: [
                'stopped'
            ]
        }]
    };
    //---#1
    ec2.describeInstances(params, function (err, data) {
        if (err) return console.log("Error connecting to #1, No Such Instance Found!");
        data.Reservations.forEach(function (reservation) {
            //  console.log(JSON.stringify(reservation));
            reservation.Instances.forEach(function (instance) {

                pushData.push({
                    InstanceId: instance.InstanceId,
                    LaunchTime: instance.LaunchTime,
                    Region: region

                });
            });
        });

        var terminateThese = [];
        if (pushData.length != 0) {
            for (var j = 0; j < pushData.length; j++) {
                let initDate = pushData[j].LaunchTime;
                //console.log("Getting Days for :"+pushData[j].InstanceId);
                var expirationData = date.getStopDate(initDate);
                //console.log("Got Days for :"+pushData[j].InstanceId+ "Terminate: " +expirationData.flag);
                if (expirationData.flag) {
                    terminateThese.push({
                        "id": pushData[j].InstanceId,
                        "days": expirationData.days,
                        "region": region
                    });
                }
            }

            if (terminateThese.length > 0) {
                terminate(ec2, terminateThese);
            }
        }

        else {
            // console.log("Safe region");
        }
    });
    function terminate(ec2, terminationData) {
        var param = [];
        var details = [];
        for (var x = 0; x < terminationData.length; x++) {
            //console.log("Instance ID: "+JSON.stringify(terminationData[x].id));
            param.push(terminationData[x].id);
            details.push({
                "Id": terminationData[x].id,
                "Days Inactive": terminationData[x].days,
                "Region": terminationData[x].region
            });
        }
        var params = {
            InstanceIds: param,
            DryRun: true
        };
        //console.log("aws params: "+JSON.stringify(params));
        ec2.terminateInstances(params, function (err, data) {
            if (err) {
                console.log("Error occured!");
                console.log(err, err.stack);

            } // an error occurred
            else {

                details.forEach(function (code) {
                    console.log(`TERMINATING
                        ${code.Id}.
                        Instance Details:
                        ${JSON.stringify(code)}`);
                });
                console.log(JSON.stringify(data));
            }           // successful response
        });

    }

};//exports


