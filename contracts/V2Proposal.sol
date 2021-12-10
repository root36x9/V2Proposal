//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract V2Proposal is Context {
    enum Vote {
        YES,
        NO
    }

    using Counters for Counters.Counter;

    Counters.Counter private _yesTracker;
    Counters.Counter private _noTracker;

    IERC721 private _nemo;

    uint256 public endsAt;

    mapping(address => bool) private _voters;

    constructor(address nemo_) {
        _nemo = IERC721(nemo_);
        endsAt = block.timestamp + 1 weeks;
    }

    function results() external view returns (uint256, uint256) {
        return (_yesTracker.current(), _noTracker.current());
    }

    function isActive() public view returns (bool) {
        return block.timestamp <= endsAt;
    }

    function vote(Vote vote_) external onlyHolder onlyOnce {
        require(isActive(), "V2Proposal: vote finished");

        if (vote_ == Vote.YES) _yesTracker.increment();
        if (vote_ == Vote.NO) _noTracker.increment();

        _voters[_msgSender()] = true;
    }

    modifier onlyHolder() {
        require(
            _nemo.balanceOf(_msgSender()) >= 50,
            "V2Proposal: have no right to vote"
        );
        _;
    }

    modifier onlyOnce() {
        require(!_voters[_msgSender()], "V2Proposal: already voted");
        _;
    }
}
