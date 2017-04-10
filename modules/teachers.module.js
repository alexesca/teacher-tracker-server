exports.formatSkillArray = (array) =>
{
    if(array){
        if(array.length > 0){
            var newArray = array.split('-');
            var lastArray = [];
            newArray.forEach(function (element) {
                if (element) {
                    lastArray.push(element);
                }

            }, this);
            return lastArray;
        }
    }
}

exports.formatSkillArrayToObject = (array) => {
    if(array){
        if(array.length > 0){
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
    }

}