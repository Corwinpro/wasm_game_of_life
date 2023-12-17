#[cfg(test)]
mod tests_universe {
    use wasm_gol;

    #[test]
    fn create_universe() {
        let mut universe = wasm_gol::Universe::new();
        universe.fill(wasm_gol::UniversePattern::Empty, 10, 10);

        assert_eq!(universe.height(), 10);
        assert_eq!(universe.width(), 10);
    }

    #[test]
    fn toggle_cell() {
        let mut universe = wasm_gol::Universe::new();
        universe.fill(wasm_gol::UniversePattern::Random, 10, 10);

        universe.toggle_cell(5, 8);
    }
}
