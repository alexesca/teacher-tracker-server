exports.formatSkillArray = (array) =>
{

    var newArray = array.split('-');
    var lastArray = [];
    newArray.forEach(function (element) {
        if (element) {
            lastArray.push(element);
        }

    }, this);

    return lastArray;
}

exports.formatSkillArrayToObject = (array) => {
    //58b8a2bca0e411cb1dc10dbb*Math--58b8a2b3a0e411cb1dc10dba*Acc
    var newArray = array.split('--');
    mapedArray = newArray.map(skill => {
            var temArray = skill.split('*');
            return {
                _id: temArray[0],
                name: temArray[1]
            }
    });
    return mapedArray;
}