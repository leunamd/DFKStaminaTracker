import logo from '../logo.svg';
import './App.css';
import Hero from './Hero';
import { useState, useEffect } from 'react';
import heroAbi from '../Config/heroAbi.json';
import questAbi from '../Config/questAbi.json';
import config from '../Config/config.json';
import { ethers } from 'ethers';
import { compare } from '../Utils/';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function App() {
	const [address, setAddress] = useState('');
	const [heroList, setHeroList] = useState([]);
	const [heroContract, setHeroContract] = useState(null);
	const [questContract, setQuestContract] = useState(null);
	const [lastUpdated, setLastUpdated] = useState(null);
	const [isFirstTime, SetIsFirstTime] = useState(true);

	const getHeroContract = () => {
		const contract = new ethers.Contract(
			config.contract.hero,
			heroAbi,
			new ethers.providers.JsonRpcProvider(config.rpc.harmony),
		);
		setHeroContract(contract);
	};
	const getQuestContract = () => {
		const contract = new ethers.Contract(
			config.contract.quest,
			questAbi,
			new ethers.providers.JsonRpcProvider(config.rpc.harmony),
		);
		setQuestContract(contract);
	};

	const getHeroes = async (address) => {
		try {
			const heroesRaw = await heroContract.getUserHeroes(address);
			let heroes = heroesRaw.map((hero) => {
				return { id: Number(hero) };
			});
			heroes.sort(compare);

			setHeroList(heroes);
			setLastUpdated(new Date().toLocaleString());

			setTimeout(() => {
				getHeroes(address);
			}, 60000);
		} catch (err) {
			console.warn(`Error getting heroes for address ${address}`);
			setTimeout(getHeroes, 60000);
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (address) {
			setAddressToStorage(address);
			getHeroes(address);
		}
	};

	useEffect(() => {
		getQuestContract();
		getHeroContract();
		getAddressFromStorage();
	}, []);

	useEffect(() => {
		if (isFirstTime && address) {
			getHeroes(address);
			SetIsFirstTime(false);
		}
	}, [address]);

	const getAddressFromStorage = () => {
		const _address = localStorage.getItem('address');
		setAddress(_address);
		return _address;
	};

	const setAddressToStorage = (address) => {
		localStorage.setItem('address', address);
	};

	return (
		<div className='App'>
			<div className='header mt-3'>
				<form onSubmit={handleSubmit}>
					<label>
						Address:{' '}
						<input
							className='bg-black text-white address-input'
							type='text'
							value={address}
							onChange={(e) => setAddress(e.target.value)}
						/>
					</label>

					<input
						className='bg-black text-white'
						type='submit'
						value='Submit'
					/>
				</form>
			</div>
			{heroList.length > 0 && (
				<div className='body mt-3'>
					<Container fluid>
						<Row className='align-items-center'>
							<Col xs={2} md>
								No.
							</Col>
							<Col className='d-none d-sm-block'>Level</Col>
							<Col xs={3} md>
								XP
							</Col>
							<Col xs={3} md>
								Questing
							</Col>
							<Col xs={4} md>
								Stamina
							</Col>
							<Col className='d-none d-sm-block'>Full at</Col>
						</Row>
						{heroList.map((hero) => (
							<Hero
								id={hero.id}
								questContract={questContract}
								heroContract={heroContract}
								key={hero.id}
							/>
						))}
					</Container>
					<Container className='mt-5'>
						<Row className='justify-content-center'>
							<Col xs='auto'>Last updated: {lastUpdated}</Col>
						</Row>
					</Container>
				</div>
			)}
		</div>
	);
}

export default App;
