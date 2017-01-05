angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("multiple-autocomplete-tpl.html","<div class=\"ng-ms form-item-container\">\r\n    <ul class=\"list-inline\">\r\n        <li ng-repeat=\"item in modelArr\"><span\r\n                ng-if=\"objectProperty == undefined || objectProperty == \'\'\"> {{item}} <span class=\"remove\"\r\n                                                                                            ng-click=\"removeAddedValues(item)\"> <i\r\n                class=\"glyphicon glyphicon-remove\"></i></span>&nbsp; </span> <span\r\n                ng-if=\"objectProperty != undefined && objectProperty != \'\'\"> {{item[objectProperty]}} <span\r\n                class=\"remove\" ng-click=\"removeAddedValues(item)\"> <i class=\"glyphicon glyphicon-remove\"></i></span>&nbsp; </span>\r\n        </li>\r\n        <li><input name=\"{{name}}\" ng-model=\"inputValue\"\r\n                   ng-hide=\"(maxSelectedItems != null && modelArr.length >= maxSelectedItems) || (!extendApiUrlWithInput && suggestArray.length <= 0)\"\r\n                   placeholder=\"\" ng-keydown=\"keyParser($event)\" err-msg-required=\"{{errMsgRequired}}\"\r\n                   ng-focus=\"onFocus()\" ng-blur=\"onBlur()\" ng-required=\"!modelArr.length && isRequired\"\r\n                   ng-change=\"onChange()\"></li>\r\n    </ul>\r\n</div>\r\n<div class=\"autocomplete-list\" ng-show=\"(isFocused || isHover) && isMinAutocompleteLengthReached\" ng-mouseenter=\"onMouseEnter()\"\r\n     ng-mouseleave=\"onMouseLeave()\">\r\n    <ul ng-if=\"objectProperty == undefined || objectProperty == \'\'\">\r\n        <li ng-class=\"{\'autocomplete-active\' : selectedItemIndex == $index}\"\r\n            ng-repeat=\"suggestion in suggestionsArr | orderBy : orderSuggestionsBy | filter : inputValue | filter : alreadyAddedValues\"\r\n            ng-click=\"onSuggestedItemsClick(suggestion)\" ng-mouseenter=\"mouseEnterOnItem($index)\"> {{suggestion}}\r\n        </li>\r\n    </ul>\r\n    <ul ng-if=\"objectProperty != undefined && objectProperty != \'\'\">\r\n        <li ng-class=\"{\'autocomplete-active\' : selectedItemIndex == $index}\"\r\n            ng-repeat=\"suggestion in suggestionsArr | orderBy : orderSuggestionsBy | filter : inputValue | filter : alreadyAddedValues\"\r\n            ng-click=\"onSuggestedItemsClick(suggestion)\" ng-mouseenter=\"mouseEnterOnItem($index)\">\r\n            {{suggestion[objectProperty]}}\r\n        </li>\r\n    </ul>\r\n</div>");}]);
(function () {
    //declare all modules and their dependencies.
    angular.module('multipleSelect', [
        'templates'
    ]).config(function () {

    });
}
)();
(function () {

    angular.module('multipleSelect').directive('multipleAutocomplete', [
        '$filter',
        '$http',
        function ($filter, $http) {
            return {
                restrict: 'EA',
                scope : {
                    suggestionsArr : '=?',
                    modelArr : '=ngModel',
                    apiUrl : '@',
                    extendApiUrlWithInput : '@',
                    minAutocompleteLength : '@',
                    orderSuggestionsBy : '@',
                    beforeSelectItem : '=?',
                    afterSelectItem : '=?',
                    beforeRemoveItem : '=?',
                    afterRemoveItem : '=?',
                    maxSelectedItems : '@'
                },
                templateUrl: 'multiple-autocomplete-tpl.html',
                link : function(scope, element, attr){



                    scope.objectProperty = attr.objectProperty;
                    scope.selectedItemIndex = 0;
                    scope.name = attr.name;
                    scope.isRequired = attr.required;
                    scope.errMsgRequired = attr.errMsgRequired;
                    scope.isHover = false;
                    scope.isFocused = false;
                    scope.isMinAutocompleteLengthReached = false;
                    scope.lastInputValue = "";
                    scope.suggestArray = [];

                    scope.$watch('modelArr', function()
                    {
                        scope.suggestArray = $filter('filter')(scope.suggestionsArr, scope.inputValue);
                        scope.suggestArray = $filter('filter')(scope.suggestArray, scope.alreadyAddedValues);
                        scope.suggestArray = $filter('orderBy')(scope.suggestArray, scope.orderSuggestionsBy);
                    }, true);

                    var getSuggestionsList = function () {
                        var url = scope.apiUrl;
                        if (scope.extendApiUrlWithInput) {
                            url = encodeURI(url + scope.inputValue);
                        }
                        $http({
                            method: 'GET',
                            url: url
                        }).then(function (response) {
                            scope.suggestionsArr = response.data;
                        }, function () {
                            console.log("*****Angular-multiple-select **** ----- Unable to fetch list");
                        });
                    };

                    var determineSuggestions = function() {
                        if(scope.suggestionsArr == null || scope.suggestionsArr == "" || scope.extendApiUrlWithInput){
                            if(scope.apiUrl != null && scope.apiUrl != "")
                                getSuggestionsList();
                            else{
                                console.log("*****Angular-multiple-select **** ----- Please provide suggestion array list or url");
                            }
                        }
                    };

                    if(scope.modelArr == null || scope.modelArr == ""){
                        scope.modelArr = [];
                    }
                    scope.onFocus = function () {
                        scope.isFocused=true
                    };

                    scope.onMouseEnter = function () {
                        scope.isHover = true
                    };

                    scope.onMouseLeave = function () {
                        scope.isHover = false;
                    };

                    scope.onBlur = function () {
                        scope.isFocused=false;
                    };

                    var onMinAutocompleteLengthReached = function() {
                        if (!scope.minAutocompleteLength) {
                            scope.isMinAutocompleteLengthReached = true;
                            determineSuggestions();
                            return;
                        }

                        scope.isMinAutocompleteLengthReached = scope.inputValue != null && scope.inputValue != "" && scope.inputValue.length >= scope.minAutocompleteLength;

                        if (scope.isMinAutocompleteLengthReached) {
                            scope.isHover = true;
                            scope.isFocused = true;
                        }

                        if (scope.isMinAutocompleteLengthReached && (scope.lastInputValue == null || scope.lastInputValue == "" || !(scope.inputValue.indexOf(scope.lastInputValue) !== -1))) {
                            determineSuggestions();
                            scope.lastInputValue = scope.inputValue;
                        }
                    };

                    scope.onChange = function () {
                        scope.selectedItemIndex = 0;
                        onMinAutocompleteLengthReached();
                    };

                    var onEnter = function() {
                        var filteredSuggestionArr = $filter('filter')(scope.suggestionsArr, scope.inputValue);
                        filteredSuggestionArr = $filter('filter')(filteredSuggestionArr, scope.alreadyAddedValues);
                        filteredSuggestionArr = $filter('orderBy')(filteredSuggestionArr, scope.orderSuggestionsBy);
                        if (scope.selectedItemIndex < filteredSuggestionArr.length)
                            scope.onSuggestedItemsClick(filteredSuggestionArr[scope.selectedItemIndex]);
                    };

                    scope.keyParser = function ($event) {
                        var keys = {
                            38: 'up',
                            40: 'down',
                            8 : 'backspace',
                            13: 'enter',
                            9 : 'tab',
                            27: 'esc'
                        };
                        var key = keys[$event.keyCode];
                        if(key == 'backspace' && scope.inputValue == ""){
                            if(scope.modelArr.length != 0){
                                scope.removeAddedValues(scope.modelArr[scope.modelArr.length-1]);
                            }
                        }
                        else if(key == 'down'){
                            var filteredSuggestionArr = $filter('filter')(scope.suggestionsArr, scope.inputValue);
                            filteredSuggestionArr = $filter('filter')(filteredSuggestionArr, scope.alreadyAddedValues);
                            filteredSuggestionArr = $filter('orderBy')(filteredSuggestionArr, scope.orderSuggestionsBy);
                            if(scope.selectedItemIndex < filteredSuggestionArr.length -1)
                                scope.selectedItemIndex++;
                        }
                        else if(key == 'up' && scope.selectedItemIndex > 0){
                            scope.selectedItemIndex--;
                        }
                        else if(key == 'esc'){
                            scope.isHover = false;
                            scope.isFocused=false;
                            scope.isMinAutocompleteLengthReached = false;
                        }
                        else if(key == 'enter'){
                            if (scope.extendApiUrlWithInput) {
                                if (scope.inputValue != null && scope.inputValue != "") {
                                    onEnter();
                                }
                            } else {
                                onEnter();
                            }
                        }
                    };

                    scope.onSuggestedItemsClick = function (selectedValue) {
                        if(scope.beforeSelectItem && typeof(scope.beforeSelectItem) == 'function')
                            scope.beforeSelectItem(selectedValue);

                        if(scope.maxSelectedItems != null) {
                            if (scope.modelArr.length < scope.maxSelectedItems) {
                                scope.modelArr.push(selectedValue);
                            }
                            if((scope.modelArr.length  >= scope.maxSelectedItems)) {
                                scope.isHover = false;
                                scope.isFocused = false;
                                scope.isMinAutocompleteLengthReached = false;
                            }
                        }
                        else
                        {
                            scope.modelArr.push(selectedValue);
                        }

                        if((scope.suggestArray != null && !scope.suggestArray.length) || scope.extendApiUrlWithInput)
                        {
                            scope.isHover = false;
                            scope.isFocused = false;
                            scope.isMinAutocompleteLengthReached = false;
                        }

                        if(scope.afterSelectItem && typeof(scope.afterSelectItem) == 'function')
                            scope.afterSelectItem(selectedValue);
                        scope.inputValue = "";
                    };

                    var isDuplicate = function (arr, item) {
                        var duplicate = false;
                        if(arr == null || arr == "")
                            return duplicate;

                        for(var i=0;i<arr.length;i++){
                            duplicate = angular.equals(arr[i], item);
                            if(duplicate)
                                break;
                        }
                        return duplicate;
                    };

                    scope.alreadyAddedValues = function (item) {
                        return !isDuplicate(scope.modelArr, item);
                    };

                    scope.removeAddedValues = function (item) {
                        if(scope.modelArr != null && scope.modelArr != "") {
                            var itemIndex = scope.modelArr.indexOf(item);
                            if (itemIndex != -1) {
                                if(scope.beforeRemoveItem && typeof(scope.beforeRemoveItem) == 'function')
                                    scope.beforeRemoveItem(item);

                                scope.modelArr.splice(itemIndex, 1);

                                if(scope.afterRemoveItem && typeof(scope.afterRemoveItem) == 'function')
                                    scope.afterRemoveItem(item);
                            }
                        }
                    };

                    scope.mouseEnterOnItem = function (index) {
                        scope.selectedItemIndex = index;
                    };
                }
            };
        }
    ]);
})();