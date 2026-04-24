using System;
using System.Collections.Generic;
using System.Numerics;
using System.Threading.Tasks;
using Thirdweb;
using Thirdweb.Unity;
using UnityEngine;

public class NFTMarketplace
{

    public const string NFT_ADDRESS = "0x815AFC2bcDec02d5b0447508EE41476fFa3817FF";
    public const string MARKETPLACE_ADDRESS = "0x289e25Ef58C00cE66eb726a8a4672B706e2f2691";

    public static NFTMarketplace Instance => _instance ??= Initialize();
    private static NFTMarketplace _instance = null;

    public string MainWallet => "0xB19aEe699eb4D2Af380c505E4d6A108b055916eB";

    public ThirdwebContract CoinContract => ThirdwebNetwork.Instance.Contract;
    public ThirdwebContract NFTContract { get; private set; }
    public ThirdwebContract MarketplaceContract { get; private set; }

    public bool IsInitialize { get; private set; } = false;
    public static Action OnInitialize;

    public IThirdwebWallet Wallet => ThirdwebNetwork.Instance.Wallet;
    public ThirdwebClient Client => ThirdwebManager.Instance.Client;
    public string WalletAddress => ThirdwebNetwork.Instance.Address;

    private static NFTMarketplace Initialize()
    {
        NFTMarketplace marketplace = new NFTMarketplace();
        marketplace.CreateContracts();
        return marketplace;
    }

    private async void CreateContracts()
    {
        NFTContract = await ThirdwebContract.Create(Client, NFT_ADDRESS, ThirdwebNetwork.CHAIN_ID);
        MarketplaceContract = await ThirdwebContract.Create(Client, MARKETPLACE_ADDRESS, ThirdwebNetwork.CHAIN_ID);
        IsInitialize = true;
        OnInitialize?.Invoke();
    }

    public async Task<NFT> GetNFT(BigInteger tokenId)
    {
        NFT nft = await NFTContract.ERC1155_GetNFT(tokenId);
        return nft;
    }

    public async Task<List<NFT>> GetAllNFTs()
    {
        List<NFT> nfts = await NFTContract.ERC1155_GetAllNFTs();
        return nfts;
    }

    public async Task<List<NFT>> GetOwnedNFTs()
    {
        List<NFT> nfts = await NFTContract.ERC1155_GetOwnedNFTs(WalletAddress);
        return nfts;
    }

    public async Task<Listing[]> GetAllListings()
    {
        BigInteger count = await MarketplaceContract.Marketplace_DirectListings_TotalListings();
        List<Listing> listings = await MarketplaceContract.Marketplace_DirectListings_GetAllValidListings(0, count - 1);
        return listings.ToArray();
    }

    public async Task<Listing[]> GetNftListings(BigInteger tokenId, Listing[] listings = null)
    {
        if (listings == null)
            listings = await GetAllListings();

        List<Listing> result = new List<Listing>();
        foreach (var item in listings)
        {
            if (item.TokenId == tokenId)
                result.Add(item);
        }
        return result.ToArray();
    }

    public async Task<Listing> GetNftMainListing(BigInteger tokenId, Listing[] listings = null)
    {
        if (listings == null)
            listings = await GetNftListings(tokenId);

        foreach (var item in listings)
        {
            if (item.ListingCreator == MainWallet)
                return item;
        }
        return null;
    }

    public async void BuyListing(Listing listing, Action onSuccess = null, Action<string> onError = null, Action<PurchaseStatus> onStatusChanged = null)
    {
        if (Wallet == null)
        {
            ThirdwebNetwork.Instance.Connect();
            onError?.Invoke("Wallet is not connected");
            return;
        }
        try
        {
            //onStatusChanged?.Invoke("Loading...");
            onStatusChanged?.Invoke(PurchaseStatus.Loading);
            BigInteger allowance = await CoinContract.ERC20_Allowance(WalletAddress, MARKETPLACE_ADDRESS);
            if (allowance < listing.PricePerToken)
            {
                //onStatusChanged?.Invoke("Approve...");
                onStatusChanged?.Invoke(PurchaseStatus.Approve);
                await CoinContract.ERC20_Approve(Wallet, MARKETPLACE_ADDRESS, listing.PricePerToken - allowance);
            }
            //onStatusChanged?.Invoke("Buying...");
            onStatusChanged?.Invoke(PurchaseStatus.Purchasing);
            await MarketplaceContract.Marketplace_DirectListings_BuyFromListing(Wallet, listing.ListingId, WalletAddress, 1, ThirdwebNetwork.CONTRACT_ADDRESS, listing.PricePerToken);
            //onStatusChanged?.Invoke("Buy");
            onStatusChanged?.Invoke(PurchaseStatus.Success);
            onSuccess?.Invoke();
        }
        catch (Exception e)
        {
            //onStatusChanged?.Invoke("Buy");
            onStatusChanged?.Invoke(PurchaseStatus.Error);
            Debug.LogError(e);
            onError?.Invoke(e.Message);
        }
    }

    public async Task<BigInteger> BalanceOf(BigInteger tokenId)
    {
        BigInteger balance = await NFTContract.ERC1155_BalanceOf(WalletAddress, tokenId);
        return balance;
    }

    public enum PurchaseStatus
    {
        Loading,
        Approve,
        Purchasing,
        Success,
        Error
    }

}
