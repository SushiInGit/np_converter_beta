
var middleman = middleman ?? {};

middleman.filterBy = function () {
    const groupData = middleman.metadata.addObject(middleman.requestData.allMetadata());

    function findCommunicationsByNumber(data, filter) {
        if (Object.keys(data).length !== 0) {
            let output = data.filter(object => {
                return JSON.stringify(object.To)
                    .toString()
                    .toLowerCase()
                    .includes(filter);
            });
            return output;
        }
    }

    function findCommunicationsByName(data, filter) {
        if (Object.keys(data).length !== 0) {
            let output = data.filter(object => {
                return JSON.stringify(object.Name)
                    .toString()
                    .toLowerCase()
                    .includes(filter);
            });
            return output;
        }
    }

    function findCommunicationsByText(data, filter) {
        if (Object.keys(data).length !== 0) {
            let output = data.filter(object => {
                const pointer = object.communications[0].Message;

                if (pointer !== null) {
                    return JSON.stringify(pointer)
                        .toString()
                        .toLowerCase()
                        .includes(filter.toString().toLowerCase());
                }
            });
            return output;
        }
    }

    function strictFilter(data, filter) {
        if (Object.keys(data).length !== 0) {
            const pointer = data ? data[0].communications : null;
            let output = pointer.filter(object => {
                if (object.Message.includes(filter.toString().toLowerCase()) === true) {
                    if (pointer !== null) {
                        return JSON.stringify(pointer)
                            .toString()
                            .toLowerCase()
                            .includes(filter.toString().toLowerCase());
                    }
                }
            });
            return output;
        };
    };


    //////// search rework v2
    function find_hasNumber(data, filter) {
        if (Array.isArray(data) && data.length > 0) {
            let output = data.filter(object => {
                const trimmedFilter = filter.trim();
                if (trimmedFilter === '' || trimmedFilter === '.') {
                    return object.hasNumber === true;
                }

                if (object.hasNumber) {
                    const outputString = JSON.stringify(object.numbers).toLowerCase();
                    return outputString.includes(trimmedFilter.toLowerCase());
                }
                return false;
            });
            return output;
        }
        return [];
    }


    function find_hasPhone(data, filter) {
        if (Array.isArray(data) && data.length > 0) {
            let output = data.filter(object => {
                const trimmedFilter = filter.trim();
                if (trimmedFilter === '' || trimmedFilter === '.') {
                    return object.hasPhone === true;
                }

                if (object.hasPhone) {
                    const outputString = JSON.stringify(object.phones).toLowerCase();
                    return outputString.includes(trimmedFilter.toLowerCase());
                }
                return false;
            });
            return output;
        }
        return [];
    }

    function find_hasLink(data, filter) {
        if (Array.isArray(data) && data.length > 0) {
            let output = data.filter(object => {
                const trimmedFilter = filter.trim();
                if (trimmedFilter === '' || trimmedFilter === '.') {
                    return object.hasLink === true;
                }

                if (object.hasLink) {
                    const outputString = JSON.stringify(object.links).toLowerCase();
                    return outputString.includes(trimmedFilter.toLowerCase());
                }
                return false;
            });
            return output;
        }
        return [];
    }

    function find_number(data, filter) {
        if (Array.isArray(data) && data.length > 0) {
            const trimmedFilter = filter.trim();
            let output = data.filter(object => {

                if (trimmedFilter === '' || trimmedFilter === '.') {
                    return true;
                }

                return JSON.stringify(object.To)
                    .toLowerCase()
                    .includes(trimmedFilter.toLowerCase());
            });
            return output;
        }
        return [];
    }

    function find_name(data, filter) {
        if (Array.isArray(data) && data.length > 0) {
            let trimmedFilter = filter.trim();
           
            if (trimmedFilter === ".") {
                trimmedFilter = "";              
            }

            let output = data.filter(object => {
                
                const pointer = object.communications[0]?.Message;
                if (object.Name === "Unknown Contact") {
                    return false;
                }

                if (trimmedFilter === '' || trimmedFilter === '.') {
                    return true;
                }

                if (pointer !== null) {
                    return JSON.stringify(pointer)
                        .toLowerCase()
                        .includes(trimmedFilter.toLowerCase());
                }
                return false;
            });
            return output;
        }
        return [];
    }

    function find_message(data, filter) {
        if (Array.isArray(data) && data.length > 0) {
            const trimmedFilter = filter.trim();

            let output = data.filter(object => {

                const pointer = object.communications[0]?.Message;

                if (trimmedFilter === '' || trimmedFilter === '.') {
                    return true;
                }

                if (pointer !== null) {
                    return JSON.stringify(pointer)
                        .toLowerCase()
                        .includes(trimmedFilter.toLowerCase());
                }
                return false;
            });
            return output;
        }
        return [];
    }

    function find_noCalls(data, filter) {
        if (Array.isArray(data) && data.length > 0) {
            const trimmedFilter = filter.trim();
            let output = data.filter(object => {
                const filteredCommunications = object.communications.filter(comm => comm.IsCall === false);

                if (filteredCommunications.length === 0) {
                    return false; 
                }
                const pointer = object.communications[0]?.Message; 
    
                if (trimmedFilter === '' || trimmedFilter === '.') {
                    return true; 
                }

                if (pointer !== null) {
                    return JSON.stringify(pointer)
                        .toLowerCase()
                        .includes(trimmedFilter.toLowerCase());
                }
                return false; 
            });
            return output; 
        }
        return []; 
    }    
    
    ////////// ALL Search
    function findCommunicationsByAll(filter) { // find + remove Dupes + sort it by groupIndex again (if its a number in the text and as phonenumber becouse i cancat it =] )
        const allData = findCommunicationsByNumber(groupData, filter).concat(findCommunicationsByText(groupData, filter));
        const ids = allData.map(({ groupIndex }) => groupIndex);
        const filtered = allData.filter(({ groupIndex }, index) => !ids.includes(groupIndex, index + 1));
        return filtered.sort(function (a, b) { return (a.groupIndex - b.groupIndex); });;
    }

    return {
        Message: (filter) => { return findCommunicationsByText(groupData, filter) },
        MessageStrict: (filter) => { return strictFilter(findCommunicationsByText(groupData, filter), filter) },
        All: (filter) => { return findCommunicationsByAll(filter) },

        // Search V2 below
        Number: (filter) => { return find_number(groupData, filter) },
        Name: (filter) => { return find_name(groupData, filter) },
        hasNumber: (filter) => { return find_hasNumber(groupData, filter) },
        hasPhone: (filter) => { return find_hasPhone(groupData, filter) },
        hasLink: (filter) => { return find_hasLink(groupData, filter) },
        hasMessage: (filter) => { return find_message(groupData, filter) },
        noCalls: (filter) => { return find_noCalls(groupData, filter) },
    }
}();