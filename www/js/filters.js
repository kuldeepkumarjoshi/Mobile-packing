angular.module('woocommerce-api.filters', [])

.filter('partition', function ($cacheFactory) {
    var arrayCache = $cacheFactory('partition');
    var filter = function (arr, size) {
      //size =1;
        if (!arr) {
            return;
        }
        var newArr = [];
        // for (var i = 0; i < arr.length; i += size) {
        //   if((i+1)%3 == 0){
        //       newArr.push(arr.slice(i, i + 1));
        //       i = i -size+1;
        //   }else{
        //       newArr.push(arr.slice(i, i + size));
        //   }
        //
        // }
        for (var i = 0; i < arr.length; i += size) {
            var arrObj = arr.slice(i, i + size);
              arrObj.rowClass = "col";
            if(arrObj.length != size){
                arrObj.rowClass = "col col-50";
            }
              newArr.push(arrObj);
        }
        var cachedParts;
        var arrString = JSON.stringify(arr);
        cachedParts = arrayCache.get(arrString + size);
        if (JSON.stringify(cachedParts) === JSON.stringify(newArr)) {
            return cachedParts;
        }
       arrayCache.put(arrString + size, newArr);
        return newArr;
    };
    return filter;
});
