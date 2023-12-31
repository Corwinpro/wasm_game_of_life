mod utils;

use rand::prelude::*;

use fixedbitset::FixedBitSet;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: FixedBitSet,
}

#[wasm_bindgen]
pub enum UniversePattern {
    Empty,
    Random,
    Pattern,
}

impl Universe {
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbour_row = (row + delta_row) % self.height;
                let neighbour_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbour_row, neighbour_col);
                count += self.cells[idx] as u8;
            }
        }

        count
    }
}

#[wasm_bindgen]
impl Universe {
    pub fn tick(&mut self) {
        let mut next = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);

                next.set(
                    idx,
                    match (self.cells[idx], self.live_neighbor_count(row, col)) {
                        (true, x) if x < 2 => false,
                        (true, 2) | (true, 3) => true,
                        (true, x) if x > 3 => false,
                        (false, 3) => true,
                        (otherwise, _) => otherwise,
                    },
                );
            }
        }

        self.cells = next;
    }

    pub fn new() -> Self {
        utils::set_panic_hook();

        Universe {
            width: 0,
            height: 0,
            cells: FixedBitSet::with_capacity(0),
        }
    }

    pub fn fill(&mut self, pattern: UniversePattern, width: u32, height: u32) {
        let premade_sample = |i: usize| i % 2 == 0 || i % 7 == 0;
        let random_sample = |_| rand::thread_rng().gen::<f32>() > 0.5;
        let empty_sample = |_| false;

        let sample = match pattern {
            UniversePattern::Random => random_sample,
            UniversePattern::Pattern => premade_sample,
            UniversePattern::Empty => empty_sample,
        };

        let size = (width * height) as usize;
        if size != (self.width * self.height) as usize {
            let cells = FixedBitSet::with_capacity(size);
            self.cells = cells;
        }
        for i in 0..size {
            self.cells.set(i, sample(i));
        }
        self.width = width;
        self.height = height;
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const u32 {
        self.cells.as_slice().as_ptr()
    }

    pub fn toggle_cell(&mut self, row: u32, column: u32) {
        let index = self.get_index(row, column);
        let current = self.cells.as_slice();
        let shift = index - (index / 32) * 32;
        self.cells.set(index, current[index / 32] >> shift & 1 == 0);
    }
}
