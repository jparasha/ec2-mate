exports.tagAndStopInstancesDaily = (ec2, region) => {
    //console.log('tagAndStopInstancesDaily called');
    addTags(ec2, createTag, describeAllInstances, region);

    /////////////////////////////////////////// Function to Describe Instances  //////////////////////////////////////////

    function describeAllInstances(ec2) {
        var EC2 = ec2;
        var params = {
            Filters: [{
                Name: 'instance-state-name',
                Values: [
                    'running'
                ],
            },
            {
                Name: 'tag:StopGroup',
                Values: [
                    'OfficeHoursTaggedShutDown'
                ],
            },
            ]
        };
        //---#1
        EC2.describeInstances(params, function (err, data) {
            if (err) return console.log("Error connecting to #1, No Such Instance Found!");
            var InstanceRegion;
            var Ids = {
                InstanceIds: []
            };
            data.Reservations.forEach(function (reservation) {
                reservation.Instances.forEach(function (instance) {
                    Ids.InstanceIds.push(instance.InstanceId);
                    InstanceRegion = instance.Placement.AvailabilityZone;
                });
            });

            if (Ids.InstanceIds.length !== 0) {
                stop(EC2, Ids, InstanceRegion);
            }
            else {
                //console.log("Safe region");
            }

        });
    }

    ////////////////////////////////////////////Function for Stopping Instances///////////////////////////////

    function stop(EC2, Ids, InstanceRegion) {
        var Id = Ids;
        var ec = EC2;
        /* var params = {
            InstanceIds: Id,
            DryRun: false
        }; */
        //console.log(InstanceRegion);
        var Instanceregion = InstanceRegion;
        //console.log('inside stop of region #3:' + Instanceregion);//#3
        console.log(`
            In ${Instanceregion} stopping ==>
            ${JSON.stringify(Id)}`); //#4
        ec.stopInstances(Id, function (err, data) {
            if (err) {
				console.log("OOps! Instance(s) in " + Instanceregion + "region doesn't fall in the condition this lambda function has been written for!"); // an error occurred
				console.log(err);

			}
            else {
                console.log(`
                    Shut Down Logs for instances in ${Instanceregion} ===>
                    ${JSON.stringify(data, null, 4)}`); // successful response

            }
        });
    }

    /////////////////////////////////////////Function to add tags to every new instance/////////////////////////////

    function addTags(ec2, callback, describe, region) {
        var tagEc2 = ec2;
        var loopOut = true;
        var currentRegion;

        tagEc2.describeInstances(function (err, data) {
            var Idz = {
                InstanceIdz: []
            };
            if (err) {
                loopOut = false;
                return console.log(err, "Error connecting #5, No Instance Found for ---tagging---!"); //#5

            }
            else {
                data.Reservations.forEach(function (reservation) {
                    reservation.Instances.forEach(function (instance, index) {
                        currentRegion = instance.Placement.AvailabilityZone;
                        //console.log('region inside addtags is::#6::'+currentRegion);//#6
                        var flag = true;
                        var instData = instance;
                        instData.Tags.forEach(function (tags, index) {

                            if (tags.Key == "elasticbeanstalk:environment-name" || tags.Key == "StopGroup" && flag) {
                                flag = false;
                            }
                        });
                        if (flag) {
                            var tagIndex = index;

                            var instId = instData.InstanceId;

                            Idz.InstanceIdz.push(instId);
                        }
                        //console.log(Idz);
                    });
                });
            }
            if (loopOut === true) {
                if (Idz.InstanceIdz.length !== 0) {
                    // console.log('inside not null calling callback #8'); //#8
                    callback(ec2, Idz);
                }
                else {
                    //console.log('No instances with relevant tag Found, stopping other available instances #9'); //#9
                    describe(ec2);

                }
            }
            else {
                console.log('inside else of #10 describeinstances in addtag---no instances found in' + currentRegion); //#10
            }
        });

    }

    //////////////////////////////////////////// Function to Create Tags/////////////////////////////////////////

    function createTag(ec2, Idz) {
        //console.log('inside createTags #11'); //#11
        var callEc2 = ec2;
        var checkId = Idz.InstanceIdz;
        var params = {
            Resources: checkId,
            Tags: [{
                Key: 'StopGroup',
                Value: 'OfficeHoursTaggedShutDown'
            }]
        };
        callEc2.createTags(params, function (err, data) {
            if (err) {
                console.log(err, err.stack + "error creating tags! #13"); //#13
                //  console.log('calling describeAllInstances(ec2) from if');
                describeAllInstances(ec2);
            } // an error occurred

            else {
                console.log(`
                    successfully added tags to::
                    ${JSON.stringify(params)}`); //#14
                //console.log('calling describeAllInstances-ec2- from else');
                describeAllInstances(ec2);
            } // successful response
        });

    }

};
