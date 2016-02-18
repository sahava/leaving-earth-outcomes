(function() {

    // Utility variables
    var addAdvancementButton = document.querySelector('#addAdvancementButton');
    var changeMode = document.querySelector('#changeMode');

    var mainContent = document.querySelector('#mainContent');

    var resetButton = document.querySelector('#resetButton');
    var resetGameModal = document.querySelector('#resetGameModal');
    var resetModalYesButton = resetGameModal.querySelector('#resetModalYesButton');
    var resetModalCancelButton = resetGameModal.querySelector('#resetModalCancelButton');

    var newAdvancementModal = document.querySelector('#newAdvancementModal');
    var numberOfOutcomes = document.querySelector('#numberOfOutcomes');

    var outcomeResultModal = document.querySelector('#outcomeResultModal');
    var outcomeContent = outcomeResultModal.querySelector('#outcomeContent');
    var shuffleOutcomesButton = outcomeResultModal.querySelector('#shuffleOutcomesButton');
    var removeOutcomeButton = outcomeResultModal.querySelector('#removeOutcomeButton');

    var blanket = document.querySelector('#blanket');

    var clickEvent = navigator.userAgent.indexOf('iPhone') > -1 || navigator.userAgent.indexOf('iPad') > -1 ? 'touchend' : 'click';

    var activeAdvancements = {};

    var shuffleArray = function (array) {
        var i, j, temp;
        for (i = array.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    };

    var initOutcomes = function () {
        var temp = [];
        var i;
        for (i = 1; i <= 90; i++) {
            temp.push(i);
        }
        return shuffleArray(temp);
    };

    var initCurrentState = function () {
        return {
            config: {
                mode: 'normal'
            },
            currentPlayer: 'p1',
            outcomesDeck: initOutcomes(),
            discardDeck: [],
            players: {
                p1: {
                    name: 'Player 1',
                    advancements: {}
                },
                p2: {
                    name: 'Player 2',
                    advancements: {}
                },
                p3: {
                    name: 'Player 3',
                    advancements: {}
                },
                p4: {
                    name: 'Player 4',
                    advancements: {}
                },
                p5: {
                    name: 'Player 5',
                    advancements: {}
                }
            }
        };
    };

    var currentState = window.Storage && window.localStorage.getItem('storedState') ? JSON.parse(window.localStorage.getItem('storedState')) : initCurrentState();

    var setConfigValues = function () {
        var viewWidth = document.documentElement.clientWidth;
        var config = currentState.config;

        if (config.mode === 'normal') {
            config.containerWidth = viewWidth < 350 ? viewWidth - 25 : 325;
            config.outcomeMargin = 25;
            config.outcomeDimension = config.containerWidth / 2 - 60;
            config.advancementMargin = config.outcomeDimension + 40;
            config.advancementFontSize = '20px';
        }
        if (config.mode === 'compact') {
            config.containerWidth = viewWidth < 185 ? viewWidth - 25 : 160;
            config.outcomeMargin = 20;
            config.outcomeDimension = config.containerWidth / 2 - 50;
            config.advancementMargin = config.outcomeDimension + 25;
            config.advancementFontSize = '12px';
        }

        config.containerHeight = config.containerWidth / 2;
        config.dialogWidth = viewWidth < 350 ? viewWidth - 25 : 325;
        config.advancementHeight = config.containerHeight - 40;
        config.advancementWidth = config.containerWidth - 25;

        config.maximumOutcomes = {
            Surveying: 1
        };
    };

    var setupModal = function (modal) {
        modal.style.width = currentState.config.dialogWidth + 'px';
        modal.style.bottom = '50%';
        modal.style.left = '50%';
        modal.style.marginBottom = '-' + modal.offsetHeight / 2 + 'px';
        modal.style.marginLeft = '-' + modal.offsetWidth / 2 + 'px';
        modal.style.visibility = 'visible';
    };

    var disableUsedAdvancements = function (player) {
        var spans = newAdvancementModal.querySelectorAll('span');
        var prop, i;
        for (prop in player.advancements) {
            if (player.advancements.hasOwnProperty(prop)) {
                for (i = 0; i < spans.length; i++) {
                    if (player.advancements[prop].name === spans[i].getAttribute('data-name')) {
                        spans[i].className = 'disabled';
                    }
                }
            }
        }
    };

    var createNewAdvancement = function () {
        blanket.style.visibility = 'visible';
        clearAdvancementModalSelections();
        numberOfOutcomes.querySelector('[data-number="3"]').className += ' selected';
        disableUsedAdvancements(currentState.players[currentState.currentPlayer]);
        setupModal(newAdvancementModal);
    };

    var resetGameSetup = function () {
        blanket.style.visibility = 'visible';
        setupModal(resetGameModal);
    };

    var removeStorageAndReset = function () {
        if (window.Storage) {
            window.localStorage.removeItem('storedState');
        }
        window.location.reload();
    };

    var cancelBlanket = function () {
        var i;
        try {
            var modals = document.querySelectorAll('.modal');
            for (i = 0; i < modals.length; i++) {
                modals[i].style.visibility = 'hidden';
            }
            shuffleOutcomesButton.style.visibility = 'inherit';
            removeOutcomeButton.style.visibility = 'inherit';
            blanket.style.visibility = 'hidden';
        }catch(e) { alert(e.message); }
    };

    var guid = function () {
        var s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    var clearAdvancementModalSelections = function () {
        var selected = numberOfOutcomes.querySelector('span.selected');
        var warning = numberOfOutcomes.querySelector('span.warning');
        if (selected) {
            selected.className = selected.className.replace('selected', '').replace(/\s$/, '');
        }
        if (warning) {
            warning.className = warning.className.replace('warning', '').replace(/\s$/, '');
        }
    };

    var newAdvancementModalHandler = function (e) {
        var target = e.target;
        var id = guid();
        var selectedNumber = numberOfOutcomes.querySelector('span.selected');
        var temp, outcomes, maximum, advancement;

        if (target.className.indexOf('advancement') > -1 && target.className.indexOf('disabled') === -1) {
            maximum = currentState.config.maximumOutcomes[target.getAttribute('data-name')];
            outcomes = selectedNumber.getAttribute('data-number');
            if (maximum < outcomes) {
                temp = numberOfOutcomes.querySelector('[data-number="' + maximum + '"]');
                if (temp.className.indexOf('warning') === -1) {
                    temp.className += ' warning';
                }
            } else {
                advancement = {
                    player: currentState.currentPlayer,
                    id: id,
                    name: target.getAttribute('data-name'),
                    outcomes: [],
                    maxLength: outcomes,
                    finalRevealed: false
                };
                currentState.players[currentState.currentPlayer].advancements[id] = advancement;
                activeAdvancements[id] = new Advancement(advancement);

                cancelBlanket();
                clearAdvancementModalSelections();
                updateStorage();
            }
        }

        if (target.className.indexOf('number') > -1 && target.className.indexOf('selected') === -1) {
            clearAdvancementModalSelections();
            target.className += ' selected';
        }
    };

    var changeViewMode = function() {
        currentState.config.mode = currentState.config.mode === 'normal' ? 'compact' : 'normal';
        updateStorage();
        window.location.reload();
    };

    var setEventListeners = function () {
        addAdvancementButton.addEventListener(clickEvent, createNewAdvancement);
        resetButton.addEventListener(clickEvent, resetGameSetup);
        changeMode.addEventListener(clickEvent, changeViewMode);

        newAdvancementModal.addEventListener(clickEvent, newAdvancementModalHandler);

        resetModalYesButton.addEventListener(clickEvent, removeStorageAndReset);
        resetModalCancelButton.addEventListener(clickEvent, cancelBlanket);

        blanket.addEventListener(clickEvent, cancelBlanket);
    };

    var createAdvancements = function () {
        var prop;
        var advancements = currentState.players[currentState.currentPlayer].advancements;
        for (prop in advancements) {
            if (advancements.hasOwnProperty(prop)) {
                activeAdvancements[prop] = new Advancement(advancements[prop]);
            }
        }
    };

    var redoOutcomesDeck = function () {
        currentState.outcomesDeck = shuffleArray(currentState.discardDeck);
        currentState.discardDeck = [];
    };

    var drawAdvancementContainer = function (name) {
        var container = SVG(mainContent).size(currentState.config.containerWidth, currentState.config.containerHeight);
        container.rect(currentState.config.advancementWidth, currentState.config.advancementHeight)
            .attr({
                x: 15,
                y: 15,
                fill: '#fff',
                stroke: '#000'
            });
        container.text(name).attr({
            x: currentState.config.advancementMargin,
            y: currentState.config.outcomeMargin
        }).font({
            family: 'Courier',
            size : currentState.config.advancementFontSize
        });
        container.image('img/0.png').attr({
            width: currentState.config.outcomeDimension,
            height: currentState.config.outcomeDimension,
            x: currentState.config.outcomeMargin,
            y: currentState.config.outcomeMargin
        });
        return container;
    };

    var drawOutcome = function (i, container, id) {
        var path;
        switch (i) {
            case 2:
                path = 'img/3.png';
                break;
            case 1:
                path = 'img/2.png';
                break;
            case 0:
                path = 'img/1.png';
                break;
        }
        return {
            outcomeCard: container.rect(currentState.config.outcomeDimension, currentState.config.outcomeDimension).attr({
                x: currentState.config.outcomeMargin,
                y: currentState.config.outcomeMargin,
                fill: '#fff',
                stroke: '#000',
                id: id
            }),
            outcomeImage: container.image(path).attr({
                width: currentState.config.outcomeDimension,
                height: currentState.config.outcomeDimension,
                x: currentState.config.outcomeMargin,
                y: currentState.config.outcomeMargin,
                id: id
            })
        }
    };

    var styleOutcomeResultsModalButtons = function() {
        shuffleOutcomesButton.style.marginTop = outcomeResultModal.offsetHeight-200 + "px";
        removeOutcomeButton.style.marginTop = outcomeResultModal.offsetHeight-200 + "px";
        shuffleOutcomesButton.style.visibility = 'visible';
        removeOutcomeButton.style.visibility = 'visible';
    };

    var Advancement = function(advancement) {
        var i, len, temp, tempGroup;
        var that = this;
        this.player = advancement.player;
        this.outcomes = advancement.outcomes;
        this.maxLength = advancement.maxLength;
        this.name = advancement.name;
        this.finalRevealed = advancement.finalRevealed;
        this.id = advancement.id;

        this.showOutcomeResult = function() {
            var topOutcome = that.outcomesDeck.last().attr('outcome');
            var final = that.outcomesDeck.members.length === 1;

            var outcomeSuccess = function() {
                if (final) {
                    outcomeContent.innerHTML = 'Final Success!<br/><br/>Click anywhere to remove.';
                    shuffleOutcomesButton.style.visibility = 'hidden';
                    removeOutcomeButton.style.visibility = 'hidden';
                    blanket.addEventListener(clickEvent, removeTopOutcome);
                    outcomeResultModal.addEventListener(clickEvent, removeTopOutcome);
                } else {
                    outcomeContent.innerHTML = 'Success!';
                    blanket.addEventListener(clickEvent, shuffleOutcomes);
                }
            };

            var outcomeFailure = function() {
                if (final) {

                }
                blanket.addEventListener(clickEvent, shuffleOutcomes);
                if (topOutcome < 76) {
                    outcomeContent.innerHTML = 'Minor Failure!';
                } else if (topOutcome < 91) {
                    outcomeContent.innerHTML = 'Major Failure!';
                }
            };

            var shuffleOutcomes = function() {
                var id = that.id;
                var temp = [];
                var i = 0;
                if (final) {
                    that.showFinalCard();
                    currentState.players[currentState.currentPlayer].advancements[id].finalRevealed = true;
                }
                that.outcomesDeck.each(function() {
                    temp.push(this.attr('outcome'));
                });
                temp = shuffleArray(temp);
                that.outcomesDeck.each(function() {
                    this.attr({outcome : temp[i]});
                    i++;
                });
                updateStorage();
                resetOutcomeResults();
            };

            var removeTopOutcome = function() {
                var id = that.id;
                var members, i;
                var outcomes = [];
                var maxLength = 0;
                that.outcomesDeck.last().remove();
                that.outcomesDeck.members.pop();
                members = that.outcomesDeck.members;
                for (i = 0; i < members.length; i++) {
                    outcomes.push(members[i].attr('outcome'));
                    maxLength += 1;
                }
                currentState.players[currentState.currentPlayer].advancements[id].outcomes = outcomes;
                currentState.players[currentState.currentPlayer].advancements[id].maxLength = maxLength;
                currentState.discardDeck.push(topOutcome);
                updateStorage();
                resetOutcomeResults();
            };

            var resetOutcomeResults = function() {
                blanket.removeEventListener(clickEvent, shuffleOutcomes);
                blanket.removeEventListener(clickEvent, removeTopOutcome);
                outcomeResultModal.removeEventListener(clickEvent, removeTopOutcome);
                shuffleOutcomesButton.removeEventListener(clickEvent, shuffleOutcomes);
                removeOutcomeButton.removeEventListener(clickEvent, removeTopOutcome);
                blanket.addEventListener(clickEvent, cancelBlanket);
                cancelBlanket();
            };

            // Listeners on the outcome buttons
            shuffleOutcomesButton.addEventListener(clickEvent, shuffleOutcomes);
            removeOutcomeButton.addEventListener(clickEvent, removeTopOutcome);

            blanket.style.visibility = 'visible';

            styleOutcomeResultsModalButtons();
            setupModal(outcomeResultModal);

            // remove default behavior of clicking the blanket
            blanket.removeEventListener(clickEvent, cancelBlanket);

            if (topOutcome < 61) {
                outcomeSuccess();
            } else {
                outcomeFailure();
            }
        };

        this.showFinalCard = function() {
            var final = this.outcomesDeck.members.length === 1;
            var finalOutcome = this.outcomesDeck.last().attr('outcome');
            var path;
            if (currentState.config.mode === 'normal') {
                path = finalOutcome < 76 ? 'img/minor.png' : 'img/major.png';
            } else {
                path = finalOutcome < 76 ? 'img/minor-compact.png' : 'img/major-compact.png';
            }
            if (final) {
                this.outcomesDeck.last().get(1).load(path);
            }
        };

        // Add cards until maxLength is reached
        while (this.outcomes.length < this.maxLength) {
            // If the outcomes deck runs out, reset it
            if (!currentState.outcomesDeck.length) {
                redoOutcomesDeck();
            }
            // Add first card in the outcomes deck to this advancement
            this.outcomes.push(currentState.outcomesDeck.shift());
        }

        this.outcomes = shuffleArray(this.outcomes);

        this.advancementContainer = drawAdvancementContainer(this.name);

        this.outcomesDeck = this.advancementContainer.set();

        for (i = 0, len = this.outcomes.length; i < len; i++) {
            temp = drawOutcome(i, this.advancementContainer, this.id);
            tempGroup = this.advancementContainer.group();
            tempGroup.add(temp.outcomeCard);
            tempGroup.add(temp.outcomeImage);
            tempGroup.attr({
                id : this.id,
                outcome : this.outcomes[i],
                x : temp.outcomeCard.x(),
                y : temp.outcomeImage.y()
            });
            this.outcomesDeck.add(tempGroup);
        }

        if (this.finalRevealed === true && this.outcomesDeck.members.length === 1) {
            this.showFinalCard();
        }

        this.outcomesDeck.on('click', this.showOutcomeResult);

        return {
            outcomesDeck : this.outcomesDeck,
            showFinalCard : this.showFinalCard,
            showOutcomeResult : this.showOutcomeResult
        }
    };

    var updateStorage = function() {
        if (window.Storage) {
            window.localStorage.removeItem('storedState');
            window.localStorage.setItem('storedState', JSON.stringify(currentState));
        }
    };

    var initPage = function() {
        setConfigValues();
        setEventListeners();
        createAdvancements();
        updateStorage();
        FastClick.attach(document.body);
    };

    initPage();
})();