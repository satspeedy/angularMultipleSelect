(function () {

    angular.module('multipleSelect').controller('homeController', function ($scope) {

            $scope.skillsList = [
                {id: 1, name : "Java"},
                {id: 2, name : "C"},
                {id: 3, name : "C++"},
                {id: 4, name : "Core Java"},
                {id: 5, name : "JavaScript"},
                {id: 6, name : "PHP"},
                {id: 7, name : "HTML"},
                {id: 8, name : "CSS"},
                {id: 9, name : "Angular Js"},
                {id: 10, name : "Bootstrap"}
            ];

            $scope.skillsList1 = [
                "Java",
                "C",
                "C++",
                "Core Java",
                "Javascript",
                "PHP",
                "MySql",
                "Hibernate",
                "Spring",
                "AngularJs",
                "BackboneJs",
                "Sencha Touch",
                "ExtJs"
            ]
    });
})();