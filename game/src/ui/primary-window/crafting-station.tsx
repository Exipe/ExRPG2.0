
import { useState } from "react";
import React = require("react");
import { Recipe } from "../../game/model/window/crafting-model";
import { ContainerModel } from "../../game/model/container-model";
import { DisplayItem, ItemContainer, MAX_SELECT_AMOUNT, SelectDialog } from "../container/container";
import { useCrafting, useInventory, useObservable } from "../hooks";

type RecipeFilter = "All" | "Unlocked" | "Craftable"

const filterOrder: RecipeFilter[] = ["Craftable", "Unlocked", "All"]

function nextFilter(filter: RecipeFilter) {
    const current = filterOrder.indexOf(filter)
    const next = (current+1) % filterOrder.length
    return filterOrder[next]
}

function filterRecipe(filter: RecipeFilter, inventory: ContainerModel, recipe: Recipe) {
    switch(filter) {
        case "All":
            return true
        case "Unlocked":
            return recipe.unlocked
        case "Craftable":
            return recipe.unlocked && recipe.materials.every(m => {
                const count = inventory.count(m[0])
                return count >= m[1]
            })
    }
}

interface CraftSelectProps {
    recipe: Recipe
    inventory: ContainerModel
    onClose: () => void
    onConfirm: (amount: number) => void 
}

export function CraftSelectDialog(props: CraftSelectProps) {
    const [amount, setAmount] = useState(1)
    const recipe = props.recipe

    const materials = recipe.materials.map((value, index) => {
        const count = props.inventory.count(value[0])
        const cost = value[1] * amount
        const textClass = count >= cost ? "has-material" : "lacks-material"

        return <div key={index} className="select-dialog-row">
            <DisplayItem item={[value[0], 1]} className='select-dialog-icon' />
            <div className={textClass}>{count} / {cost}</div>
        </div>
    })

    const confirm = () => {
        if(amount == 0 || amount > MAX_SELECT_AMOUNT) {
            return
        }

        props.onConfirm(amount)
    }

    return <SelectDialog 
        selectAmount={amount}
        setAmount={setAmount}
        onClose={props.onClose}
        item={[recipe.item, 1]}>
        
        <>{materials}</>
        <div className="select-dialog-button" onClick={confirm}>
            Confirm
        </div>
    </SelectDialog>
}

export function CraftingStation() {
    const model = useCrafting();
    const inventoryModel = useInventory();

    const station = useObservable(model.observable);
    const inventory = useObservable(inventoryModel.observable);

    const [filter, setFilter] = useState(filterOrder[0])
    const [select, setSelect] = useState(null as Recipe)

    const selectCraft = (recipe: Recipe) => {
        setSelect(model.select(recipe))
    }

    const close = () => {
        model.close()
    }

    const closeSelect = () => {
        setSelect(null)
    }

    const changeFilter = () => {
        setFilter(nextFilter(filter))
    }

    const craft = (amount: number) => {
        setSelect(null)
        model.craft(select, amount)
    }

    let found = false
    const predicate = filterRecipe.bind(null, filter, inventory)
    const displayItems = station.recipes.filter(predicate).map((recipe, idx) => {
        if(recipe == select) {
            found = true
        }
        const selectDialog = recipe == select ?
            <CraftSelectDialog onConfirm={craft} onClose={closeSelect} 
                inventory={inventory} recipe={recipe}></CraftSelectDialog> : <></>

        return <DisplayItem key={idx} 
            item={[recipe.item, 1]}
            className={recipe.unlocked ? "recipe-unlocked" : "recipe-locked"}
            onClick={() => selectCraft(recipe)}>
            {selectDialog}
        </DisplayItem>
    })
    if(select != null && !found) {
        setSelect(null)
    }

    return <div id="crafting-window" className="window box-gradient">
        <div style={{display: "flex"}} className="top-right">
            <div onClick={changeFilter} id="crafting-filter">
                Filter: {filter}</div>
            <div className="close-button"
                onClick={close}></div>
        </div>

        <p className="window-name">{station.name}</p>
        
        <ItemContainer>{displayItems}</ItemContainer>
    </div>
}